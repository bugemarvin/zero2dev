"""The terminal interface behind check.py."""
import os
import shutil
import sqlite3
import sys
from pathlib import Path

from . import core, doctor, progress as prog, providers, runner, services, workspaces
from .core import ROOT, Skip, clip
from .toolchains import LANGS

USAGE = """zero2dev exercise checker.

    python3 check.py next            what to do next
    python3 check.py c/01-hello      run the tests for one exercise
    python3 check.py c               run every exercise in a track
    python3 check.py list            all exercises and their status
    python3 check.py progress        totals per track
    python3 check.py doctor          what this machine has, and what Docker can supply
    python3 check.py stacks          the tracks, and whether this machine is ready for each
    python3 check.py services        databases: status | up <name> | down [name] [--purge]
    python3 check.py prefetch <name> download in advance: a workspace, a language image or a service
    python3 check.py hint <id>       show the hints for an exercise
    python3 check.py start <id> [--lang java]   create a starter file or working folder
    python3 check.py reset <id>      recreate the working folder of a git/shell exercise
    python3 check.py show <id>       SQL exercises: run your query and print its result

To work in the browser instead:  python3 app.py
Standard library only."""


# ---------------------------------------------------------------- output

def _supports_unicode():
    enc = (getattr(sys.stdout, "encoding", "") or "").lower()
    return "utf" in enc


USE_COLOR = sys.stdout.isatty() and "NO_COLOR" not in os.environ
OK_MARK, FAIL_MARK, SKIP_MARK = ("✓", "✗", "–") if _supports_unicode() else ("PASS", "FAIL", "SKIP")


def color(text, code):
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text


def green(t): return color(t, "32")
def red(t): return color(t, "31")
def yellow(t): return color(t, "33")
def bold(t): return color(t, "1")
def dim(t): return color(t, "2")


def rel(path):
    try:
        return str(Path(path).relative_to(Path.cwd()))
    except ValueError:
        return str(path)


# ---------------------------------------------------------------- selecting

def resolve(selector, exercises):
    """Match 'c', 'c/01', 'c/01-hello' or a unique fragment to exercises."""
    selector = selector.strip("/")
    exact = [e for e in exercises if e.id == selector]
    if exact:
        return exact
    in_track = [e for e in exercises if e.track == selector]
    if in_track:
        return in_track
    prefix = [e for e in exercises if e.id.startswith(selector)]
    if len(prefix) == 1:
        return prefix
    fragment = [e for e in exercises if selector in e.id]
    if len(fragment) == 1:
        return fragment
    options = prefix or fragment
    if options:
        sys.exit(f"'{selector}' matches several exercises: " + ", ".join(e.id for e in options[:8]))
    sys.exit(f"No exercise matches '{selector}'. Try: python3 check.py list")


# ---------------------------------------------------------------- running

def run_and_report(ex, progress, lang=None):
    """Returns True (passed), False (failed) or None (skipped)."""
    print(bold(f"{ex.id}") + f"  {ex.title}")
    if ex.kind == "sandbox" and not ex.sandbox.exists():
        runner.setup_sandbox(ex, ex.sandbox)
        print(f"  Your working folder for this exercise is ready:\n\n      cd {ex.sandbox}\n")
        print(f"  Do the task there ({rel(ex.dir / 'README.md')}), then run this command again.\n")
        return None
    try:
        results = runner.run_checks(ex, lang=lang)
    except Skip as skip:
        print(f"  {yellow(SKIP_MARK)} skipped: {skip}\n")
        return None

    for r in results:
        mark = green(OK_MARK) if r.ok else red(FAIL_MARK)
        print(f"  {mark} {r.name}")
        if r.detail and not r.ok:
            for line in r.detail.split("\n"):
                print(f"      {line}")
    passed = bool(results) and all(r.ok for r in results)
    entry = prog.record(progress, ex.id, passed)
    good = sum(1 for r in results if r.ok)
    if passed:
        print(green(f"  PASSED {good}/{len(results)}") + "\n")
    else:
        print(red(f"  FAILED {good}/{len(results)} passed"))
        hint = prog.next_hint(ex, entry)
        if hint:
            print(f"  Hint: {hint}")
        elif ex.spec.get("hints"):
            print(dim(f"  Stuck? python3 check.py hint {ex.id}"))
        if ex.kind == "sandbox":
            print(dim(f"  Working folder: {ex.sandbox}"))
        print()
    prog.save_progress(progress)
    return passed


def cmd_run(selectors, lang):
    exercises = core.load_exercises()
    chosen = []
    for sel in selectors:
        chosen += exercises if sel == "all" else resolve(sel, exercises)
    progress = prog.load_progress()
    outcomes = [run_and_report(ex, progress, lang) for ex in chosen]
    if len(chosen) > 1:
        print(bold(f"{outcomes.count(True)} passed, {outcomes.count(False)} failed, "
                   f"{outcomes.count(None)} skipped"))
    return 1 if False in outcomes else 0


def cmd_list():
    progress = prog.load_progress()
    track = None
    for ex in core.load_exercises():
        if ex.track != track:
            track = ex.track
            print(bold(f"\n{track}"))
        mark = green(OK_MARK) if progress.get(ex.id, {}).get("passed") else dim("·")
        print(f"  {mark} {ex.id:<34} {ex.title}")
    print()
    return 0


def cmd_progress():
    progress = prog.load_progress()
    exercises = core.load_exercises()
    total_done = 0
    for track in dict.fromkeys(e.track for e in exercises):
        items = [e for e in exercises if e.track == track]
        done = sum(1 for e in items if progress.get(e.id, {}).get("passed"))
        total_done += done
        width = 24
        filled = round(width * done / len(items))
        print(f"  {track:<14} {'#' * filled}{'.' * (width - filled)} {done}/{len(items)}")
    print(bold(f"\n  {total_done}/{len(exercises)} exercises passed"))
    return 0


def cmd_next():
    progress = prog.load_progress()
    chosen = prog.load_profile().get("tracks") or []
    exercises = core.load_exercises()
    if chosen:
        exercises = [e for e in exercises if e.track in chosen] or exercises
    for ex in exercises:
        if not progress.get(ex.id, {}).get("passed"):
            print(bold(f"Next: {ex.id}") + f"  {ex.title}")
            if ex.lesson:
                print(f"  Lesson:  {rel(ROOT / 'guide' / 'lessons' / (ex.lesson + '.html'))}")
            print(f"  Task:    {rel(ex.dir / 'README.md')}")
            print(f"  Check:   python3 check.py {ex.id}")
            return 0
    print(green("Everything is passed. Well done."))
    return 0


def cmd_hint(selector):
    for ex in resolve(selector, core.load_exercises()):
        hints = ex.spec.get("hints", [])
        print(bold(ex.id) + f"  {ex.title}")
        if not hints:
            print("  No hints for this one. Re-read the lesson and the task.")
        for i, hint in enumerate(hints, 1):
            print(f"  {i}. {hint}")
    return 0


def create_starter(ex, lang):
    """Create the default file for a language in an any-language exercise. Returns (path, created)."""
    target = ex.dir / LANGS[lang]["file"]
    if target.exists():
        return target, False
    target.write_text(LANGS[lang]["starter"], encoding="utf-8")
    return target, True


def cmd_start(selector, lang):
    for ex in resolve(selector, core.load_exercises()):
        if ex.kind == "sandbox":
            if ex.sandbox.exists():
                print(f"{ex.id}: working folder already exists: {ex.sandbox}")
            else:
                runner.setup_sandbox(ex, ex.sandbox)
                print(f"{ex.id}: working folder ready: {ex.sandbox}")
            continue
        if ex.kind != "program" or ex.spec.get("lang", "any") != "any":
            print(f"{ex.id}: edit the files in {rel(ex.dir)}")
            continue
        if not lang:
            sys.exit(f"Pick a language: python3 check.py start {ex.id} --lang <{'|'.join(LANGS)}>")
        if lang not in LANGS:
            sys.exit(f"Unknown language '{lang}'. Known: {', '.join(LANGS)}")
        target, created = create_starter(ex, lang)
        print(f"{ex.id}: " + (f"created {rel(target)}" if created else f"{rel(target)} already exists, left as it is"))
        print(f"  Check with: python3 check.py {ex.id} --lang {lang}")
    return 0


def cmd_show(selector):
    """Run a SQL exercise's query against its sample data and print the result, without judging it."""
    for ex in resolve(selector, core.load_exercises()):
        if ex.kind != "sql":
            print(f"{ex.id}: 'show' is for SQL exercises")
            continue
        print(bold(ex.id) + f"  result of {ex.spec.get('file', 'query.sql')}")
        try:
            columns, rows = runner.show_sql(ex)
            for line in clip(runner.sql_table(columns, rows), 40, 4000).split("\n"):
                print("  " + line)
            print(dim(f"  ({len(rows)} row{'s' if len(rows) != 1 else ''})"))
        except Skip as skip:
            print(f"  {yellow(SKIP_MARK)} {skip}")
        except sqlite3.Error as exc:
            print("  " + red("error: ") + str(exc))
    return 0


def cmd_reset(selector):
    for ex in resolve(selector, core.load_exercises()):
        if ex.kind != "sandbox":
            print(f"{ex.id}: to restore the starter files run: git checkout -- {rel(ex.dir)}")
            continue
        if ex.sandbox.exists():
            shutil.rmtree(ex.sandbox)
        runner.setup_sandbox(ex, ex.sandbox)
        print(f"{ex.id}: working folder recreated: {ex.sandbox}")
    return 0


# ---------------------------------------------------------------- environment

STATE_MARK = {"native": (OK_MARK, green), "docker": (OK_MARK, green), "running": (OK_MARK, green),
              "docker-download": (SKIP_MARK, yellow), "workspace-download": (SKIP_MARK, yellow),
              "stopped": (SKIP_MARK, yellow), "absent": (SKIP_MARK, yellow),
              "missing": (FAIL_MARK, red), "unavailable": (FAIL_MARK, red)}


def status_line(item, width=12):
    mark, paint = STATE_MARK.get(item["state"], (SKIP_MARK, dim))
    return f"  {paint(mark)} {item['name']:<{width}} {item['detail']}"


def cmd_doctor():
    report = doctor.report()
    print(bold("Languages") + dim("   (installed tools are used as they are; Docker fills the gaps)"))
    for item in report["toolchains"]:
        print(status_line(item))
    print(bold("\nTools"))
    for item in report["tools"] + [report["docker"]]:
        print(status_line(item))
    print(bold("\nServices"))
    for item in report["services"]:
        print(status_line(item))
    if report["workspaces"]:
        print(bold("\nPackage workspaces"))
        for item in report["workspaces"]:
            print(status_line(item, 22))
    print(f"\n  Working folders and downloads: {report['work_root']}")
    return 0


def cmd_stacks(args):
    if args and args[0] == "choose":
        known = [t["id"] for t in doctor.tracks()]
        unknown = [a for a in args[1:] if a not in known]
        if unknown:
            sys.exit(f"Unknown track: {', '.join(unknown)}. Known: {', '.join(known)}")
        profile = prog.load_profile()
        profile["tracks"] = args[1:]
        prog.save_profile(profile)
        print("Chosen tracks: " + (", ".join(args[1:]) or "all"))
        return 0
    chosen = prog.load_profile().get("tracks") or []
    for track in doctor.tracks():
        tag = green(" ready") if track["ready"] else yellow(" needs setup")
        star = "*" if track["id"] in chosen else " "
        print(bold(f"{star} {track['id']:<14}") + f"{track['title']}{tag}")
        for item in track["needs"]:
            print("  " + status_line(item))
    print(dim("\n  * = chosen. Choose with: python3 check.py stacks choose react next"))
    return 0


def cmd_services(args):
    purge = "--purge" in args
    args = [a for a in args if a != "--purge"]
    action = args[0] if args else "status"
    names = args[1:] or list(services.SERVICES)
    unknown = [n for n in names if n not in services.SERVICES]
    if unknown or action not in ("status", "up", "down"):
        sys.exit("Usage: python3 check.py services [status | up <name> | down [name] [--purge]]\n"
                 f"Services: {', '.join(services.SERVICES)}")
    if action == "up" and len(args) < 2:
        sys.exit("Say which one: python3 check.py services up postgres")
    for name in names:
        try:
            if action == "up":
                item = services.up(name)
            elif action == "down":
                item = services.down(name, purge=purge)
            else:
                item = services.status(name)
        except Skip as skip:
            print(f"  {red(FAIL_MARK)} {services.SERVICES[name]['name']:<12} {skip}")
            continue
        print(status_line(item))
        if item["state"] == "running":
            print(dim(f"      connect: {item['connect']}"))
    return 0


def prefetch(name, log=print):
    """Download what a workspace, language or service needs. Returns True on success."""
    if name in workspaces.available():
        workspaces.ensure(name, log=lambda text: log(text.rstrip("\n")))
        log(f"workspace {name}: ready")
        return True
    image = None
    if name in LANGS:
        image = LANGS[name].get("image")
        if providers.native_ok(LANGS[name]["needs"]):
            log(f"{LANGS[name]['name']}: already installed on this machine, nothing to download")
            return True
    elif name in services.SERVICES:
        image = services.SERVICES[name]["image"]
        if services.native_ok(name):
            log(f"{services.SERVICES[name]['name']}: already running on this machine, nothing to download")
            return True
    if not image:
        log(f"nothing to download for '{name}'")
        return False
    state = providers.docker_state()
    if state != "ok":
        log(providers.DOCKER_HELP[state])
        return False
    if providers.image_present(image):
        log(f"{image}: already downloaded")
        return True
    log(f"downloading {image} ...")
    ok, message = providers.pull_image(image)
    log(f"{image}: " + ("downloaded" if ok else f"failed: {message[-300:]}"))
    return ok


def cmd_prefetch(names):
    if not names:
        options = workspaces.available() + [k for k, v in LANGS.items() if v.get("image")] + list(services.SERVICES)
        sys.exit("Usage: python3 check.py prefetch <name> ...\nNames: " + ", ".join(options))
    ok = True
    for name in names:
        try:
            ok = prefetch(name) and ok
        except Skip as skip:
            print(f"{name}: {skip}")
            ok = False
    return 0 if ok else 1


def main(argv):
    lang = None
    if "--lang" in argv:
        i = argv.index("--lang")
        if i + 1 >= len(argv):
            sys.exit("--lang needs a value, for example: --lang java")
        lang = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(USAGE)
        return 0
    command, rest = argv[0], argv[1:]
    simple = {"list": cmd_list, "progress": cmd_progress, "next": cmd_next, "doctor": cmd_doctor}
    if command in simple:
        return simple[command]()
    if command == "stacks":
        return cmd_stacks(rest)
    if command == "services":
        return cmd_services(rest)
    if command == "prefetch":
        return cmd_prefetch(rest)
    if command in ("hint", "reset", "start", "show"):
        if not rest:
            sys.exit(f"Usage: python3 check.py {command} <exercise>")
        if command == "hint":
            return cmd_hint(rest[0])
        if command == "reset":
            return cmd_reset(rest[0])
        if command == "show":
            return cmd_show(rest[0])
        return cmd_start(rest[0], lang)
    return cmd_run(argv, lang)
