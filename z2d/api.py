"""The JSON API behind the local web app. Each handler takes a dict and returns a dict.

Nothing here accepts a command line or a file path from the browser as is:
exercises are looked up by id, files by the names an exercise declares, and
programs are the ones the exercise catalog defines. The exceptions are the
learner's own code (that is the point of the app) and the command line of
git/shell exercises, which runs in that exercise's working folder.
"""
import json
import os
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import threading

from . import background, core, doctor, jobs, origins, platforminfo, progress as prog, providers, runner, services, workspaces
from .core import Skip
from .toolchains import LANGS

MAX_FILE = 200_000
_run_slots = threading.Semaphore(2)          # at most two test runs at a time
_apps = {}                                   # exercise id -> running runner.App
_cwds = {}                                   # exercise id -> current folder of its command line
_state_lock = threading.Lock()
_starters = None

HIGHLIGHT = {".c": "c", ".h": "c", ".py": "python", ".java": "java", ".ex": "elixir", ".exs": "elixir",
             ".sql": "sql", ".sh": "bash", ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript",
             ".ts": "javascript", ".tsx": "javascript", ".go": "go", ".rs": "rust", ".php": "php",
             ".html": "html", ".css": "css", ".json": "javascript"}


class ApiError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def exercise(data):
    ex = core.find_exercise(str(data.get("id", "")))
    if ex is None:
        raise ApiError("unknown exercise", 404)
    return ex


def starters():
    global _starters
    if _starters is None:
        path = core.CATALOG / "starters.json"
        _starters = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    return _starters


def current_lang(ex, requested=None):
    if ex.kind != "program" or ex.spec.get("lang", "any") != "any":
        return ex.spec.get("lang")
    if requested in LANGS:
        return requested
    try:
        return runner.pick_language(ex, ex.dir)
    except Skip:
        return "python"


def read_text(path):
    try:
        if path.stat().st_size > MAX_FILE:
            return None
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None


def list_files(ex, lang):
    """Editable files first, then the other files of the exercise, read-only (tests, headers, seed data)."""
    editable = runner.editable_files(ex, lang)
    files = []
    for name in editable:
        content = read_text(ex.dir / name)
        files.append({"name": name, "content": content if content is not None else "", "editable": True,
                      "exists": content is not None})
    other_langs = {info["file"] for info in LANGS.values()} if ex.spec.get("lang", "any") == "any" else set()
    for path in sorted(ex.dir.rglob("*")):
        name = path.relative_to(ex.dir).as_posix()
        if (not path.is_file() or name in editable or name in ("exercise.json", "README.md")
                or name in other_langs
                or any(part.startswith(".") or part == "node_modules" for part in path.relative_to(ex.dir).parts)):
            continue
        content = read_text(path)
        if content is not None:
            files.append({"name": name, "content": content, "editable": False, "exists": True})
    for f in files:
        f["highlight"] = HIGHLIGHT.get(os.path.splitext(f["name"])[1], "text")
    return files


def describe(ex, lang=None):
    lang = current_lang(ex, lang)
    entry = prog.load_progress().get(ex.id, {})
    info = {
        "id": ex.id, "title": ex.title, "kind": ex.kind, "lang": lang,
        "any_lang": ex.kind == "program" and ex.spec.get("lang", "any") == "any",
        "files": list_files(ex, lang),
        "hints": ex.spec.get("hints", []),
        "passed": bool(entry.get("passed")), "attempts": entry.get("attempts", 0),
        "can_show": ex.kind in ("sql", "mongo", "redis"), "can_start_app": app_spec(ex) is not None,
        "sandbox": None, "app": None, "toolchain": None,
    }
    if info["any_lang"]:
        info["langs"] = [{"id": key, "name": value["name"], "exists": (ex.dir / value["file"]).exists()}
                         for key, value in LANGS.items()]
    if ex.kind == "sandbox":
        info["sandbox"] = {"path": str(ex.sandbox), "ready": ex.sandbox.exists()}
    if lang in LANGS and ex.kind in ("program", "harness", "http"):
        info["toolchain"] = doctor.toolchain(lang)
    if ex.kind == "pyfunc":
        info["toolchain"] = doctor.toolchain("python")
    if ex.spec.get("engine") == "postgres":
        info["service"] = services.status("postgres")
    if ex.kind == "mongo":
        info["service"] = services.status("mongodb")
    if ex.kind == "redis":
        info["service"] = services.status("redis")
    with _state_lock:
        app = _apps.get(ex.id)
    if app:
        info["app"] = {"url": f"http://127.0.0.1:{app.port}/"}
    return info


def app_spec(ex):
    """How to start the exercise's app for the learner to look at, or None."""
    if ex.kind == "http":
        return ex.spec
    if ex.kind == "web":
        # a static file server, so the learner sees the page as a browser shows it
        return {"lang": "python", "start": [sys.executable, "-m", "http.server", "{port}", "--bind", "127.0.0.1"]}
    if ex.spec.get("preview") == "static":
        return {"lang": "python", "start": [sys.executable, "-m", "http.server", "{port}", "--bind", "127.0.0.1"]}
    if "preview" in ex.spec:
        return dict(ex.spec["preview"], lang=ex.spec.get("lang", "javascript"),
                    workspace=ex.spec.get("workspace"))
    return None


def save_files(ex, lang, files):
    allowed = set(runner.editable_files(ex, lang))
    for name, content in (files or {}).items():
        if name not in allowed:
            raise ApiError(f"{name} is not an editable file of this exercise", 403)
        if not isinstance(content, str) or len(content) > MAX_FILE:
            raise ApiError(f"{name} is too large", 413)
        target = ex.dir / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        with _state_lock:
            app = _apps.get(ex.id)
        if app and app.staged:
            # the running app works on a copy inside its workspace: keep it in step, so dev servers reload
            copy = app.cwd / name
            copy.parent.mkdir(parents=True, exist_ok=True)
            copy.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------- handlers

def get_state(_data):
    progress = prog.load_progress()
    exercises = core.load_exercises()
    return {
        "progress": prog.public(progress),
        "profile": prog.load_profile(),
        "exercises": [{"id": e.id, "title": e.title, "track": e.track, "kind": e.kind} for e in exercises],
        "work_root": str(core.WORK_ROOT),
        "platform": platforminfo.detect(),
    }


def get_exercise(data):
    return describe(exercise(data), data.get("lang"))


def post_save(data):
    ex = exercise(data)
    save_files(ex, current_lang(ex, data.get("lang")), data.get("files"))
    return {"saved": True}


def post_lang(data):
    """Switch an any-language exercise to another language, creating its starter file if needed."""
    ex = exercise(data)
    lang = data.get("lang")
    if lang not in LANGS or ex.spec.get("lang", "any") != "any" or ex.kind != "program":
        raise ApiError("this exercise does not support that language")
    target = ex.dir / LANGS[lang]["file"]
    if not target.exists():
        target.write_text(LANGS[lang]["starter"], encoding="utf-8")
    os.utime(target)          # the newest solution file is the one the checker picks
    return describe(ex, lang)


def post_run(data):
    ex = exercise(data)
    lang = current_lang(ex, data.get("lang"))
    save_files(ex, lang, data.get("files"))
    if ex.kind == "sandbox" and not ex.sandbox.exists():
        runner.setup_sandbox(ex, ex.sandbox)
    if ex.kind == "http":       # the tests start the app themselves, on their own port
        with _state_lock:
            app = _apps.pop(ex.id, None)
        if app:
            app.stop()
    with _run_slots:
        try:
            results = runner.run_checks(ex, lang=lang if ex.kind == "program" else None)
        except core.NeedsDownload as need:
            return {"status": "skipped", "skip": str(need), "download": {"kind": need.kind, "name": need.name}}
        except Skip as skip:
            return {"status": "skipped", "skip": str(skip)}
    passed = bool(results) and all(r.ok for r in results)
    progress = prog.load_progress()
    entry = prog.record(progress, ex.id, passed)
    prog.save_progress(progress)
    return {
        "status": "passed" if passed else "failed",
        "results": [r.as_dict() for r in results],
        "hint": None if passed else prog.next_hint(ex, entry),
        "attempts": entry["attempts"],
        "progress": prog.public(progress),
    }


def post_reset(data):
    """Put the editable files back to their starter content."""
    ex = exercise(data)
    lang = current_lang(ex, data.get("lang"))
    original = starters().get(ex.id, {})
    restored = []
    for name in runner.editable_files(ex, lang):
        if name in original:
            content = original[name]
        elif ex.spec.get("lang", "any") == "any" and lang in LANGS and name == LANGS[lang]["file"]:
            content = LANGS[lang]["starter"]
        else:
            continue
        (ex.dir / name).write_text(content, encoding="utf-8")
        restored.append(name)
    return dict(describe(ex, lang), restored=restored)


def post_show(data):
    ex = exercise(data)
    if ex.kind not in ("sql", "mongo", "redis"):
        raise ApiError("show is for SQL, MongoDB and Redis exercises")
    save_files(ex, None, data.get("files"))
    if ex.kind == "redis":
        try:
            return {"text": runner.show_redis(ex)[:20000] or "(no output)"}
        except core.NeedsDownload as need:
            return {"error": str(need), "download": {"kind": need.kind, "name": need.name}}
        except Skip as skip:
            return {"error": str(skip)}
    if ex.kind == "mongo":
        try:
            error, result = runner.show_mongo(ex)
        except core.NeedsDownload as need:
            return {"error": str(need), "download": {"kind": need.kind, "name": need.name}}
        except Skip as skip:
            return {"error": str(skip)}
        if error:
            return {"error": error}
        if result is None:
            return {"text": "The script ran. It defines no `result` variable, so there is nothing to show."}
        return {"text": json.dumps(result, indent=2)[:20000]}
    try:
        columns, rows = runner.show_sql(ex)
    except core.NeedsDownload as need:
        return {"error": str(need), "download": {"kind": need.kind, "name": need.name}}
    except Skip as skip:
        return {"error": str(skip)}
    except sqlite3.Error as exc:
        return {"error": str(exc)}
    return {"columns": columns, "rows": rows[:200], "total": len(rows)}


SHELL_SCRIPT = ('cd -- "$Z2D_CWD" 2>/dev/null || cd -- "$Z2D_SANDBOX"; eval "$Z2D_CMD"; __code=$?; '
                'pwd > "$Z2D_PWDFILE"; exit $__code')


def post_shell(data):
    """Run one command in the working folder of a git/shell exercise."""
    ex = exercise(data)
    if ex.kind != "sandbox":
        raise ApiError("the command line is for git and shell exercises")
    command = str(data.get("command", "")).strip()
    if not command or len(command) > 2000:
        raise ApiError("empty or too long command")
    if not ex.sandbox.exists():
        runner.setup_sandbox(ex, ex.sandbox)
    with _state_lock:
        cwd = _cwds.get(ex.id, str(ex.sandbox))
    with tempfile.NamedTemporaryFile("r", suffix=".pwd") as pwdfile:
        env = dict(os.environ, Z2D_CWD=cwd, Z2D_SANDBOX=str(ex.sandbox), Z2D_CMD=command,
                   Z2D_PWDFILE=pwdfile.name, GIT_EDITOR="true", GIT_PAGER="cat", PAGER="cat",
                   TERM="dumb", GIT_TERMINAL_PROMPT="0")
        code, out, err = core.run(["bash", "-c", SHELL_SCRIPT], stdin="", timeout=60, env=env)
        new_cwd = pwdfile.read().strip() or cwd
    with _state_lock:
        _cwds[ex.id] = new_cwd
    try:
        shown = os.path.relpath(new_cwd, ex.sandbox)
    except ValueError:
        shown = new_cwd
    return {
        "code": code, "timed_out": code is None,
        "stdout": core.clip(out, 200, 20000), "stderr": core.clip(err, 100, 8000),
        "cwd": "." if shown == "." else shown,
    }


def post_sandbox(data):
    ex = exercise(data)
    if ex.kind != "sandbox":
        raise ApiError("only git and shell exercises have a working folder")
    if data.get("action") == "reset" and ex.sandbox.exists():
        shutil.rmtree(ex.sandbox)
    if not ex.sandbox.exists():
        runner.setup_sandbox(ex, ex.sandbox)
    with _state_lock:
        _cwds.pop(ex.id, None)
    return describe(ex)


def post_app(data):
    """Start or stop the app of an http exercise, so the learner can open it in a browser tab."""
    ex = exercise(data)
    spec = app_spec(ex)
    if spec is None:
        raise ApiError("this exercise has no app to start")
    with _state_lock:
        app = _apps.pop(ex.id, None)
    if app:
        app.stop()
    if data.get("action") == "stop":
        return {"app": None}
    save_files(ex, None, data.get("files"))
    try:
        app = runner.App(ex, ex.dir, spec)
        problem = app.start()
    except core.NeedsDownload as need:
        return {"app": None, "error": str(need), "download": {"kind": need.kind, "name": need.name}}
    except Skip as skip:
        return {"app": None, "error": str(skip)}
    if problem:
        app.stop()
        return {"app": None, "error": problem}
    with _state_lock:
        _apps[ex.id] = app
    return {"app": {"url": f"http://127.0.0.1:{app.port}/"}}


def stop_all_apps():
    with _state_lock:
        apps = list(_apps.values())
        _apps.clear()
    for app in apps:
        app.stop()


def post_open(data):
    """Open the exercise folder in VS Code, if the `code` command exists."""
    ex = exercise(data)
    if data.get("with") == "files":
        target = ex.sandbox if ex.kind == "sandbox" and ex.sandbox.exists() else ex.dir
        shown = platforminfo.windows_path(target) or str(target)
        if platforminfo.open_folder(target):
            return {"opened": True, "path": shown}
        return {"opened": False, "error": "Open this folder yourself: " + shown}
    if shutil.which("code") is None:
        return {"opened": False, "error": "the `code` command was not found. Open this folder yourself: "
                                          + str(ex.sandbox if ex.kind == "sandbox" else ex.dir)}
    target = ex.sandbox if ex.kind == "sandbox" and ex.sandbox.exists() else ex.dir
    subprocess.Popen(["code", str(target)], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)
    return {"opened": True, "path": str(target)}


def get_doctor(data):
    if data.get("fresh"):
        doctor.forget()
    report = doctor.report()
    report["tracks"] = doctor.tracks()
    report["profile"] = prog.load_profile()
    report["can_sudo"] = can_sudo()
    report["platform"] = platforminfo.detect()
    report["fallback_stacks"] = sorted(FALLBACK_STACKS)
    return report


def get_track(data):
    """What one track needs and whether this machine has it, for the install box of its first lesson."""
    for track in doctor.tracks():
        if track["id"] == data.get("id"):
            return dict(track, can_sudo=can_sudo(), user_stacks=sorted(USER_STACKS),
                        fallback_stacks=sorted(FALLBACK_STACKS), platform=platforminfo.detect())
    raise ApiError("unknown track", 404)


def get_origins(_data):
    return {"origins": origins.trusted()}


def post_pair(data):
    """Approve a website. The server only accepts this from its own pages, never from the website itself."""
    origin = origins.add(data.get("origin"))
    if origin is None:
        raise ApiError("that is not a website address this app can approve. It must look like https://example.com")
    return {"origins": origins.trusted(), "paired": origin}


def post_unpair(data):
    origins.remove(data.get("origin"))
    return {"origins": origins.trusted()}


def get_autostart(_data):
    return dict(background.autostart_status(), running=background.status())


def post_autostart(data):
    """Switch "start when I log in" on or off. Uses only per-user mechanisms: no administrator rights."""
    if data.get("enable"):
        ok, message = background.autostart_on()
        if ok:
            background.record_choice("on")
    else:
        ok, message = background.autostart_off()
        background.record_choice("off")
    return dict(background.autostart_status(), ok=ok, message=message)


def get_game(_data):
    return {"game": prog.load_game()}


def post_game(data):
    """Store the learner's quiz results, streak and place. The page owns the format; the server keeps it."""
    game = data.get("game")
    if not isinstance(game, dict) or len(json.dumps(game)) > 400_000:
        raise ApiError("game must be an object of a sensible size")
    prog.save_game(game)
    return {"saved": True}


def post_profile(data):
    known = {t["id"] for t in json.loads((core.ROOT / "content" / "tracks.json").read_text(encoding="utf-8"))}
    tracks = [t for t in data.get("tracks", []) if t in known]
    profile = prog.load_profile()
    profile["tracks"] = tracks
    prog.save_profile(profile)
    return {"profile": profile}


def post_service(data):
    name = data.get("name")
    if name not in services.SERVICES:
        raise ApiError("unknown service", 404)
    action = data.get("action")
    doctor.forget()
    if action == "down":
        return {"service": services.down(name, purge=bool(data.get("purge")))}
    if action != "up":
        raise ApiError("action must be up or down")
    spec = services.SERVICES[name]
    if providers.docker_state() == "ok" and not providers.image_present(spec["image"]):
        return {"download": {"kind": "image", "name": spec["image"]},
                "error": f"{spec['name']} needs the image {spec['image']} (one-time download)."}
    try:
        return {"service": services.up(name)}
    except Skip as skip:
        return {"error": str(skip), "service": services.status(name)}


# Stacks whose install needs no administrator rights: they go into the user's home folder.
USER_STACKS = {"node", "java", "go", "rust", "elixir"}
ALL_STACKS = USER_STACKS | {"core", "python", "ruby", "php", "postgres", "sqlite", "redis", "mongodb", "docker"}
# Stacks that install.sh can also install another way (from the system packages), with --fallback.
FALLBACK_STACKS = {"node", "java", "go", "rust", "elixir"}


def can_sudo():
    """True when sudo works without asking for a password (or we are root)."""
    if os.geteuid() == 0:
        return True
    if shutil.which("sudo") is None:
        return False
    try:
        code, _, _ = core.run(["sudo", "-n", "true"], timeout=10)
    except Skip:
        return False
    return code == 0


def post_job(data):
    kind, name = data.get("kind"), str(data.get("name", ""))
    if kind == "image":
        known = {v.get("image") for v in LANGS.values()} | {v["image"] for v in services.SERVICES.values()}
        if name not in known:
            raise ApiError("unknown image", 404)

        def work(job):
            job.log(f"docker pull {name}")
            ok, message = providers.pull_image(name)
            job.log(message[-1500:])
            return ok

        return jobs.start(f"Downloading {name}", work).as_dict()

    if kind == "workspace":
        if name not in workspaces.available():
            raise ApiError("unknown workspace", 404)

        def work(job):
            workspaces.ensure(name, log=job.log)
            job.log("ready")
            return True

        return jobs.start(f"Downloading packages for {name}", work).as_dict()

    if kind == "install":
        if name not in ALL_STACKS:
            raise ApiError("unknown stack", 404)
        script = core.ROOT / "setup" / "install.sh"
        if not platforminfo.detect()["installer"]:
            raise ApiError("the install script needs Ubuntu or Debian (apt). On this system install the tool "
                           "with your own package manager, or let Docker run it.", 409)
        if data.get("fallback"):
            if name not in FALLBACK_STACKS:
                raise ApiError(f"{name} has only one way of installing")
            if not can_sudo():
                raise ApiError("installing from the system packages needs your password. Run this in a terminal: "
                               f"./setup/install.sh --stack {name} --fallback", 409)
            cmd = ["bash", str(script), "--yes", "--fallback", "--stack", name]
        elif name in USER_STACKS:
            cmd = ["bash", str(script), "--yes", "--no-sudo", "--stack", name]
        elif can_sudo():
            cmd = ["bash", str(script), "--yes", "--stack", name]
        else:
            raise ApiError(f"installing {name} needs your password. Run this in a terminal: "
                           f"./setup/install.sh --stack {name}", 409)

        def work(job):
            job.log("$ " + " ".join(cmd[1:]))
            proc = subprocess.Popen(cmd, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                    text=True, errors="replace", start_new_session=True)
            for line in proc.stdout:
                job.log(line)
            return proc.wait() == 0

        return jobs.start(f"Installing {name}", work).as_dict()
    raise ApiError("unknown job kind")


def get_job(data):
    job = jobs.get(str(data.get("id", "")))
    if job is None:
        raise ApiError("unknown job", 404)
    if job.as_dict().get("state") != "running":
        doctor.forget()         # something was installed or downloaded: look at the machine again
    return job.as_dict()


GET = {"state": get_state, "exercise": get_exercise, "doctor": get_doctor, "job": get_job, "track": get_track, "game": get_game, "autostart": get_autostart, "origins": get_origins}
POST = {"save": post_save, "lang": post_lang, "run": post_run, "reset": post_reset, "show": post_show,
        "shell": post_shell, "sandbox": post_sandbox, "app": post_app, "open": post_open,
        "profile": post_profile, "service": post_service, "job": post_job, "game": post_game, "autostart": post_autostart,
        "pair": post_pair, "unpair": post_unpair}
