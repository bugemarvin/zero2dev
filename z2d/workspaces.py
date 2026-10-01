"""Dependency folders for stacks that need packages (React, Next.js, Express ...).

catalog/workspaces/<name>/ holds a package.json, a lock file and config. It is
installed once into ~/zero2dev-work/.workspaces/<name>/ and reused by every
exercise of that stack, so `npm install` does not run per exercise.
"""
import hashlib
import json
import shutil
import threading
import uuid

from . import core

SOURCE = core.CATALOG / "workspaces"
AUTO_INSTALL = True    # the web app sets this to False and offers a Download button
_locks = {}
_guard = threading.Lock()


def root(name):
    return core.WORK_ROOT / ".workspaces" / name


def available():
    return sorted(p.name for p in SOURCE.iterdir() if (p / "workspace.json").exists()) if SOURCE.is_dir() else []


def config(name):
    path = SOURCE / name / "workspace.json"
    if not path.exists():
        raise core.Skip(f"unknown workspace: {name}")
    return json.loads(path.read_text(encoding="utf-8"))


def _stamp(name):
    digest = hashlib.sha256()
    for path in sorted((SOURCE / name).rglob("*")):
        if path.is_file():
            digest.update(path.name.encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()


def is_ready(name):
    stamp = root(name) / ".z2d-stamp"
    return stamp.exists() and stamp.read_text() == _stamp(name)


def ensure(name, log=None):
    """Install the workspace's dependencies if that has not been done yet. Returns its folder."""
    with _guard:
        lock = _locks.setdefault(name, threading.Lock())
    with lock:
        cfg = config(name)
        dst = root(name)
        if is_ready(name):
            return dst
        if not AUTO_INSTALL and log is None:
            raise core.NeedsDownload("workspace", name,
                                     f"the {cfg['title']} packages are not downloaded yet (one time, needs internet). "
                                     f"Download them with: python3 check.py prefetch {name}")
        for tool in cfg.get("needs", []):
            if shutil.which(tool) is None:
                raise core.Skip(f"the {cfg['title']} workspace needs {tool}. "
                                f"Install with: setup/install.sh --stack {cfg.get('stack', 'node')}")
        dst.mkdir(parents=True, exist_ok=True)
        for path in (SOURCE / name).iterdir():
            if path.is_file():
                shutil.copy(path, dst / path.name)
        for cmd in cfg.get("setup", []):
            if log:
                log(f"$ {' '.join(cmd)}   (in {dst}, one time, needs internet)\n")
            code, out, err = core.run(cmd, cwd=dst, timeout=3600)
            if log:
                log((out + err)[-4000:])
            if code != 0:
                tail = (err or out).strip().splitlines()[-6:]
                raise core.Skip(f"could not prepare the {cfg['title']} workspace ({' '.join(cmd)}):\n      "
                                + "\n      ".join(tail))
        (dst / ".z2d-stamp").write_text(_stamp(name))
        return dst


def stage(name, ex, exdir):
    """Copy an exercise into the workspace. Returns (workspace_root, relative_run_folder)."""
    base = ensure(name)
    rel = f"run/{ex.track}-{ex.dir.name}-{uuid.uuid4().hex[:8]}"
    shutil.copytree(exdir, base / rel, ignore=shutil.ignore_patterns("node_modules", ".next", "exercise.json"))
    return base, rel


def unstage(base, rel):
    shutil.rmtree(base / rel, ignore_errors=True)
