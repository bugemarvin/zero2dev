"""The language table (catalog/toolchains.json) and how to build and run with it."""
import json
import threading

from . import core, providers

LANGS = json.loads((core.CATALOG / "toolchains.json").read_text(encoding="utf-8"))

_sanitizer_ok = {}
_sanitizer_lock = threading.Lock()


def open_env(lang, exdir, outdir, network=False, writable=False):
    if lang not in LANGS:
        raise core.Skip(f"unknown language '{lang}'. Known: {', '.join(LANGS)}")
    info = LANGS[lang]
    return providers.open_env(info["name"], info["needs"], info.get("image"), info["stack"],
                              exdir, outdir, network=network, writable=writable,
                              cache=providers.cache_mount(lang, info.get("docker_cache")))


def sanitizers_work(info, env):
    """Probe once per provider: can a sanitized binary be built and run here?"""
    key = (env.kind, getattr(env, "image", ""))
    with _sanitizer_lock:
        if key not in _sanitizer_ok:
            (env.outdir / "z2d_probe.c").write_text("int main(void) { return 0; }\n")
            code, _, _ = env.run(["gcc", *info["sanitize"], env.out("z2d_probe.c"), "-o", env.out("z2d_probe")],
                                 timeout=120)
            if code == 0:
                code, _, _ = env.run([env.out("z2d_probe")], timeout=30)
            _sanitizer_ok[key] = code == 0
        return _sanitizer_ok[key]


def expand(template, values):
    """Fill a command template. A value that is a list expands into several arguments."""
    cmd = []
    for part in template:
        if part.startswith("{") and part.endswith("}") and isinstance(values.get(part[1:-1]), list):
            cmd += values[part[1:-1]]
            continue
        for key, value in values.items():
            if not isinstance(value, list):
                part = part.replace("{" + key + "}", value)
        cmd.append(part)
    return cmd


def build(lang, sources, env, main="Main"):
    """Compile or syntax-check. Returns (Result or None, run_command, run_environment)."""
    info = LANGS[lang]
    values = {
        "sources": [env.ex(s) for s in sources],
        "src": env.ex(sources[0]),
        "out": env.out(),
        "main": main,
        "python": env.python,
    }
    if "cflags" in info:
        values["cflags"] = info["cflags"] + (info["sanitize"] if sanitizers_work(info, env) else [])
    run_env = {k: expand([v], values)[0] for k, v in info.get("env", {}).items()}
    runner = expand(info["run"], values)
    if "build" not in info:
        return None, runner, run_env
    code, out, err = env.run(expand(info["build"], values), timeout=180, env=run_env)
    label = "compiles without warnings" if info.get("compiled") else "has no syntax errors"
    if code != 0:
        message = (err + out).strip() or core.describe_exit(code)
        return core.Result(False, label, core.clip(message, 25, 3000)), runner, run_env
    return core.Result(True, label), runner, run_env
