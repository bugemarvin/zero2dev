"""What this machine already has, what Docker can supply, and what is missing."""
import json
import shutil
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor

from . import core, providers, services, workspaces
from .toolchains import LANGS

TOOLS = {
    "bash": {"name": "Bash", "version": ["bash", "--version"], "stack": "core"},
    "git": {"name": "Git", "version": ["git", "--version"], "stack": "core"},
    "make": {"name": "Make", "version": ["make", "--version"], "stack": "core"},
    "docker": {"name": "Docker", "version": ["docker", "--version"], "stack": "docker"},
    "npm": {"name": "npm", "version": ["npm", "--version"], "stack": "node"},
    "browser": {"name": "A web browser", "version": None, "stack": None},
}


# Looking at the machine means running dozens of small commands. One page load asks for the
# same facts several times (the report, then every track), so answers are kept for a few seconds.
_TTL = 8
_memo = {}
_memo_lock = threading.Lock()


def _remember(key, compute):
    with _memo_lock:
        hit = _memo.get(key)
        if hit and time.time() - hit[0] < _TTL:
            return hit[1]
    value = compute()
    with _memo_lock:
        _memo[key] = (time.time(), value)
    return value


def forget():
    """Something was installed, downloaded or started: look again next time."""
    with _memo_lock:
        _memo.clear()


def first_line(cmd):
    try:
        code, out, err = core.run(cmd, timeout=20)
    except core.Skip:
        return None
    lines = [line.strip() for line in (out + err).split("\n") if line.strip()]
    return lines[0] if code == 0 and lines else None


def toolchain(lang):
    """How a language is available here: native, docker, or missing."""
    return dict(_remember(("toolchain", lang), lambda: _toolchain(lang)))


def _toolchain(lang):
    info = LANGS[lang]
    base = {"id": lang, "name": info["name"], "stack": info["stack"], "image": info.get("image"),
            "install": f"setup/install.sh --stack {info['stack']}"}
    if providers.native_ok(info["needs"]):
        cmd = [sys.executable if part == "{python}" else part for part in info["version"]]
        version = first_line(cmd) or "installed"
        return dict(base, state="native", version=version,
                    detail=f"already installed on this machine ({version}). Nothing to do.")
    docker = providers.docker_state()
    if info.get("image") and docker == "ok":
        if providers.image_present(info["image"]):
            return dict(base, state="docker", version=info["image"],
                        detail=f"not installed, and that is fine: it runs in Docker ({info['image']}, already downloaded).")
        return dict(base, state="docker-download", version=info["image"],
                    detail=f"not installed. It can run in Docker after a one-time download of {info['image']}.")
    hint = "" if not info.get("image") else f" Or with Docker: {providers.DOCKER_HELP[docker]}"
    return dict(base, state="missing", version=None,
                detail=f"not installed. Install with: setup/install.sh --stack {info['stack']}.{hint}")


def tool(name):
    return dict(_remember(("tool", name), lambda: _tool(name)))


def _tool(name):
    info = TOOLS[name]
    if name == "browser":
        return {"id": name, "name": info["name"], "stack": None, "install": None, "state": "native", "version": None,
                "detail": "you are using one right now. Nothing to install."}
    base = {"id": name, "name": info["name"], "stack": info["stack"],
            "install": f"setup/install.sh --stack {info['stack']}"}
    if name == "docker":
        state = providers.docker_state(fresh=True)
        if state == "ok":
            version = first_line(info["version"]) or "installed"
            return dict(base, state="native", version=version, detail=f"installed and running ({version}).")
        return dict(base, state="missing", version=None, detail=providers.DOCKER_HELP[state])
    if shutil.which(name):
        version = first_line(info["version"]) or "installed"
        return dict(base, state="native", version=version,
                    detail=f"already installed on this machine ({version}). Nothing to do.")
    return dict(base, state="missing", version=None, detail=f"not installed. Install with: {base['install']}")


def service(name):
    return dict(_remember(("service", name), lambda: services.status(name)))


def workspace(name):
    return dict(_remember(("workspace", name), lambda: _workspace(name)))


def _workspace(name):
    cfg = workspaces.config(name)
    ready = workspaces.is_ready(name)
    return {"id": name, "name": cfg["title"], "state": "native" if ready else "workspace-download",
            "version": None, "stack": cfg.get("stack", "node"),
            "detail": "packages are installed." if ready else
            "packages are not downloaded yet (one time, needs internet): "
            f"python3 check.py prefetch {name}"}


def need(item):
    """Status of one entry of a track's "needs" list, such as toolchain:c or service:postgres."""
    kind, _, name = item.partition(":")
    if kind == "toolchain":
        return dict(toolchain(name), kind=kind)
    if kind == "service":
        return dict(service(name), kind=kind)
    if kind == "workspace":
        return dict(workspace(name), kind=kind)
    return dict(tool(name), kind="tool")


def warm(items):
    """Look up many needs at once. The commands mostly wait, so threads make this several times faster."""
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(need, sorted(set(items))))


def tracks():
    data = json.loads((core.ROOT / "content" / "tracks.json").read_text(encoding="utf-8"))
    warm(item for track in data for item in track.get("needs", []))
    result = []
    for track in data:
        needs = [need(item) for item in track.get("needs", [])]
        blocking = [n for n in needs if n["state"] in ("missing", "unavailable") and n["kind"] != "service"]
        result.append({"id": track["id"], "title": track["title"], "blurb": track.get("blurb", ""),
                       "needs": needs, "ready": not blocking})
    return result


def report():
    warm([f"toolchain:{lang}" for lang in LANGS] + ["tool:git", "tool:make", "tool:npm", "tool:docker"]
         + [f"service:{name}" for name in services.SERVICES] + [f"workspace:{name}" for name in workspaces.available()])
    return {
        "docker": tool("docker"),
        "provider": providers.mode(),
        "toolchains": [toolchain(lang) for lang in LANGS],
        "tools": [tool(name) for name in ("git", "make", "npm")],
        "services": [service(name) for name in services.SERVICES],
        "workspaces": [workspace(name) for name in workspaces.available()],
        "work_root": str(core.WORK_ROOT),
    }
