#!/usr/bin/env python3
"""zero2dev exercise checker.

    python3 check.py next            what to do next
    python3 check.py c/01-hello      run the tests for one exercise
    python3 check.py c               run every exercise in a track
    python3 check.py list            all exercises and their status
    python3 check.py progress        totals per track
    python3 check.py doctor          which toolchains are installed
    python3 check.py hint <id>       show the hints for an exercise
    python3 check.py start <id> [--lang java]   create a starter file or sandbox
    python3 check.py reset <id>      recreate the sandbox of a git/shell exercise

Standard library only. Works offline.
"""
import csv
import datetime
import io
import json
import os
import re
import shutil
import signal
import sqlite3
import subprocess
import sys
import tempfile
import threading
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EX_ROOT = ROOT / "exercises"
PROGRESS_FILE = ROOT / ".progress.json"
PROGRESS_JS = ROOT / "guide" / "progress.js"
WORK_ROOT = Path(os.environ.get("Z2D_WORK", Path.home() / "zero2dev-work"))
DEFAULT_TIMEOUT = 10

C_FLAGS = ["-std=gnu11", "-Wall", "-Wextra", "-Werror", "-Wno-unused-parameter", "-g"]
SANITIZE = ["-fsanitize=address,undefined", "-fno-omit-frame-pointer"]

# One entry per language. To support a new one, add it here.
#   file:   default file name the learner writes
#   needs:  executables that must be on PATH
#   stack:  the setup/install.sh stack that provides them
#   starter: file content created by `check.py start <id> --lang <x>`
LANGS = {
    "c": {
        "name": "C", "file": "main.c", "needs": ["gcc"], "stack": "core",
        "starter": '#include <stdio.h>\n\nint main(void) {\n    /* read the input with scanf, print the answer with printf */\n    return 0;\n}\n',
    },
    "cpp": {
        "name": "C++", "file": "main.cpp", "needs": ["g++"], "stack": "core",
        "starter": '#include <iostream>\nusing namespace std;\n\nint main() {\n    // read the input with cin, print the answer with cout\n    return 0;\n}\n',
    },
    "python": {
        "name": "Python", "file": "solution.py", "needs": [], "stack": "python",
        "starter": 'import sys\n\ndata = sys.stdin.read().split()\n# data is a list of the whitespace-separated tokens of the input\n',
    },
    "bash": {
        "name": "Bash", "file": "solution.sh", "needs": ["bash"], "stack": "core",
        "starter": '#!/usr/bin/env bash\n# read the input from stdin, print the answer\n',
    },
    "java": {
        "name": "Java", "file": "Main.java", "needs": ["javac", "java"], "stack": "java",
        "starter": 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        // read the input with in.nextInt(), in.next(), in.nextLine()\n    }\n}\n',
    },
    "elixir": {
        "name": "Elixir", "file": "solution.exs", "needs": ["elixir"], "stack": "elixir",
        "starter": 'tokens = IO.read(:stdio, :eof) |> String.split()\n# tokens is a list of the whitespace-separated strings of the input\n',
    },
    "javascript": {
        "name": "JavaScript", "file": "solution.js", "needs": ["node"], "stack": "node",
        "starter": 'const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);\n// tokens is an array of the whitespace-separated strings of the input\n',
    },
    "go": {
        "name": "Go", "file": "main.go", "needs": ["go"], "stack": "go",
        "starter": 'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tfmt.Fscan(in, &n)\n\tfmt.Println(n)\n}\n',
    },
    "rust": {
        "name": "Rust", "file": "main.rs", "needs": ["rustc"], "stack": "rust",
        "starter": 'use std::io::Read;\n\nfn main() {\n    let mut input = String::new();\n    std::io::stdin().read_to_string(&mut input).unwrap();\n    let tokens: Vec<&str> = input.split_whitespace().collect();\n    println!("{}", tokens.len());\n}\n',
    },
    "ruby": {
        "name": "Ruby", "file": "solution.rb", "needs": ["ruby"], "stack": "ruby",
        "starter": 'tokens = STDIN.read.split\n# tokens is an array of the whitespace-separated strings of the input\n',
    },
}


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


def clip(text, max_lines=12, max_chars=1200):
    """Shorten long output so one failure does not flood the terminal."""
    text = text.rstrip("\n")
    lines = text.split("\n")
    if len(lines) > max_lines:
        lines = lines[:max_lines] + [f"... ({len(lines) - max_lines} more lines)"]
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[:max_chars] + " ..."
    return text


def block(label, text):
    """Format a labelled, indented block for a failure report."""
    text = clip(text)
    if text == "":
        text = "(nothing)"
    lines = text.split("\n")
    pad = " " * (len(label) + 1)
    return "\n".join([f"{label} {lines[0]}"] + [pad + line for line in lines[1:]])


# ---------------------------------------------------------------- model

class Skip(Exception):
    """The exercise cannot be checked on this machine (missing toolchain)."""


class Result:
    def __init__(self, ok, name, detail=""):
        self.ok = ok
        self.name = name
        self.detail = detail


class Exercise:
    def __init__(self, path):
        self.dir = path
        self.track = path.parent.name
        self.id = f"{self.track}/{path.name}"
        self.spec = json.loads((path / "exercise.json").read_text(encoding="utf-8"))
        self.title = self.spec["title"]
        self.kind = self.spec["kind"]
        self.lesson = self.spec.get("lesson", "")
        self.timeout = self.spec.get("timeout", DEFAULT_TIMEOUT)

    @property
    def sandbox(self):
        return WORK_ROOT / self.track / self.dir.name


def track_order():
    tracks_file = ROOT / "content" / "tracks.json"
    if tracks_file.exists():
        return [t["id"] for t in json.loads(tracks_file.read_text(encoding="utf-8"))]
    return []


def load_exercises():
    order = track_order()
    found = [Exercise(p.parent) for p in EX_ROOT.glob("*/*/exercise.json")]

    def key(ex):
        rank = order.index(ex.track) if ex.track in order else len(order)
        return (rank, ex.track, ex.dir.name)

    return sorted(found, key=key)


# ---------------------------------------------------------------- processes

def run(cmd, cwd=None, stdin="", timeout=DEFAULT_TIMEOUT, env=None):
    """Run a command. Returns (exit_code, stdout, stderr); exit_code is None on timeout."""
    try:
        proc = subprocess.Popen(
            cmd, cwd=cwd, env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, text=True, errors="replace", start_new_session=True,
        )
    except FileNotFoundError:
        raise Skip(f"command not found: {cmd[0]}")
    try:
        out, err = proc.communicate(stdin, timeout=timeout)
        return proc.returncode, out, err
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            proc.kill()
        proc.communicate()
        return None, "", ""


def norm(text):
    """Compare output ignoring trailing spaces and trailing blank lines."""
    lines = text.replace("\r\n", "\n").split("\n")
    return "\n".join(line.rstrip() for line in lines).rstrip("\n")


def require(lang):
    info = LANGS[lang]
    missing = [tool for tool in info["needs"] if shutil.which(tool) is None]
    if missing:
        raise Skip(f"{info['name']} needs {', '.join(missing)}. Install with: setup/install.sh --stack {info['stack']}")


def describe_exit(code):
    if code is None:
        return "timed out (infinite loop, or waiting for input that never comes?)"
    if code < 0:
        try:
            name = signal.Signals(-code).name
        except ValueError:
            name = f"signal {-code}"
        extra = " (segmentation fault: bad pointer or array index)" if name == "SIGSEGV" else ""
        return f"crashed with {name}{extra}"
    return f"exited with code {code}"


# ---------------------------------------------------------------- program kind

_sanitizer_ok = None
_sanitizer_lock = threading.Lock()


def sanitizers_work():
    """Probe once: can this machine build and run a sanitized binary?"""
    global _sanitizer_ok
    with _sanitizer_lock:
        if _sanitizer_ok is None:
            with tempfile.TemporaryDirectory() as tmp:
                src = Path(tmp) / "probe.c"
                src.write_text("int main(void) { return 0; }\n")
                exe = str(Path(tmp) / "probe")
                code, _, _ = run(["gcc", *SANITIZE, str(src), "-o", exe], timeout=60)
                if code == 0:
                    code, _, _ = run([exe], timeout=20)
                _sanitizer_ok = code == 0
        return _sanitizer_ok


def build(lang, sources, exdir, builddir, main="Main"):
    """Compile if the language needs it. Returns (Result or None, run_command)."""
    require(lang)
    paths = [str(exdir / s) for s in sources]
    exe = str(builddir / "prog")
    cmd = None
    if lang == "c":
        flags = C_FLAGS + (SANITIZE if sanitizers_work() else [])
        cmd, runner = ["gcc", *flags, *paths, "-o", exe, "-lm"], [exe]
    elif lang == "cpp":
        cmd, runner = ["g++", "-std=c++17", "-Wall", "-Wextra", "-O1", *paths, "-o", exe], [exe]
    elif lang == "java":
        cmd, runner = ["javac", "-d", str(builddir), *paths], ["java", "-cp", str(builddir), main]
    elif lang == "go":
        cmd, runner = ["go", "build", "-o", exe, *paths], [exe]
    elif lang == "rust":
        cmd, runner = ["rustc", "--edition", "2021", "-O", "-o", exe, paths[0]], [exe]
    elif lang == "python":
        cmd, runner = [sys.executable, "-m", "py_compile", *paths], [sys.executable, paths[0]]
    elif lang == "bash":
        cmd, runner = ["bash", "-n", paths[0]], ["bash", paths[0]]
    elif lang == "elixir":
        runner = ["elixir", paths[0]]
    elif lang == "javascript":
        cmd, runner = ["node", "--check", paths[0]], ["node", paths[0]]
    elif lang == "ruby":
        cmd, runner = ["ruby", "-c", paths[0]], ["ruby", paths[0]]
    else:
        raise Skip(f"unknown language: {lang}")
    if cmd is None:
        return None, runner
    env = dict(os.environ, PYTHONPYCACHEPREFIX=str(builddir / "pycache"))
    code, out, err = run(cmd, cwd=exdir, timeout=120, env=env)
    label = "compiles without warnings" if lang in ("c", "cpp", "java", "go", "rust") else "has no syntax errors"
    if code != 0:
        message = (err + out).strip() or describe_exit(code)
        return Result(False, label, clip(message, 25, 3000)), runner
    return Result(True, label), runner


def pick_language(ex, exdir, lang_override=None):
    """Which language is the learner solving this exercise in?"""
    declared = ex.spec.get("lang", "any")
    if declared != "any":
        return declared
    if lang_override:
        if lang_override not in LANGS:
            raise Skip(f"unknown language '{lang_override}'. Known: {', '.join(LANGS)}")
        return lang_override
    # The most recently edited solution file wins; Python is the default.
    present = [(name, (exdir / info["file"]).stat().st_mtime)
               for name, info in LANGS.items() if (exdir / info["file"]).exists()]
    if not present:
        raise Skip("no solution file found. Create one with: python3 check.py start "
                   f"{ex.id} --lang <{'|'.join(LANGS)}>")
    newest = max(m for _, m in present)
    candidates = [name for name, m in present if m == newest]
    return "python" if "python" in candidates else candidates[0]


def check_program(ex, exdir, lang_override=None):
    lang = pick_language(ex, exdir, lang_override)
    sources = ex.spec.get("sources") or [LANGS[lang]["file"]]
    for s in sources:
        if not (exdir / s).exists():
            return [Result(False, f"{s} exists", f"Create it with: python3 check.py start {ex.id} --lang {lang}")]
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        builddir = Path(tmp)
        built, runner = build(lang, sources, exdir, builddir, ex.spec.get("main", "Main"))
        if built is not None:
            results.append(built)
            if not built.ok:
                return results
        env = dict(os.environ,
                   ASAN_OPTIONS="detect_leaks=1:color=never",
                   UBSAN_OPTIONS="halt_on_error=1:print_stacktrace=1:color=never",
                   PYTHONDONTWRITEBYTECODE="1")
        for i, case in enumerate(ex.spec["cases"], 1):
            name = case.get("name", f"case {i}")
            rundir = builddir / f"run{i}"
            rundir.mkdir()
            for fname, content in case.get("files", {}).items():
                (rundir / fname).write_text(content, encoding="utf-8")
            code, out, err = run(runner + case.get("args", []), cwd=rundir,
                                 stdin=case.get("stdin", ""), timeout=ex.timeout, env=env)
            want_exit = case.get("exit", 0)
            parts = []
            if case.get("stdin"):
                parts.append(block("input:   ", case["stdin"]))
            if case.get("args"):
                parts.append(block("args:    ", " ".join(case["args"])))
            if code != want_exit:
                parts.append(f"the program {describe_exit(code)}, expected exit code {want_exit}")
                if out.strip():
                    parts.append(block("stdout:  ", norm(out)))
                if err.strip():
                    parts.append(block("stderr:  ", err))
                results.append(Result(False, name, "\n".join(parts)))
                continue
            if "stdout" in case and norm(out) != norm(case["stdout"]):
                parts.append(block("expected:", norm(case["stdout"])))
                parts.append(block("got:     ", norm(out)))
                if err.strip():
                    parts.append(block("stderr:  ", err))
                results.append(Result(False, name, "\n".join(parts)))
                continue
            results.append(Result(True, name))
    return results


# ---------------------------------------------------------------- pyfunc kind

PYFUNC_RUNNER = r'''
import contextlib, importlib.util, io, json, math, sys, traceback

spec = json.load(sys.stdin)
real_stdout = sys.stdout
results = []

def finish():
    real_stdout.write("\n@@Z2D@@" + json.dumps(results) + "\n")
    real_stdout.flush()
    sys.exit(0)

def load(path, name):
    s = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(s)
    sys.modules[name] = module
    s.loader.exec_module(module)
    return module

def explain(exc):
    """Error type, message, and the line of the learner's file that raised it."""
    where = ""
    for frame in reversed(traceback.extract_tb(exc.__traceback__)):
        if frame.filename.endswith(spec["file"]):
            where = f" ({spec['file']} line {frame.lineno}: {frame.line})"
            break
    return f"{type(exc).__name__}: {exc}{where}"

def plain(v):
    if isinstance(v, (list, tuple)):
        return [plain(x) for x in v]
    if isinstance(v, (set, frozenset)):
        return sorted((plain(x) for x in v), key=repr)
    if isinstance(v, dict):
        return {str(k): plain(x) for k, x in v.items()}
    return v

def same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return type(a) == type(b) and a == b

sys.path.insert(0, ".")
sink = io.StringIO()
with contextlib.redirect_stdout(sink):
    try:
        module = load(spec["file"], spec["file"].rsplit(".", 1)[0])
    except BaseException as exc:
        results.append([False, spec["file"] + " loads without errors", explain(exc)])
        finish()

    for case in spec.get("cases", []):
        fname = case.get("call", spec.get("function"))
        args = case.get("args", [])
        shown = ", ".join(repr(a) for a in args)
        if len(shown) > 70:
            shown = shown[:70] + "..."
        name = case.get("name", f"{fname}({shown})")
        fn = getattr(module, fname, None)
        if not callable(fn):
            results.append([False, name, f"{spec['file']} does not define a function named {fname}"])
            continue
        try:
            got = plain(fn(*args))
        except BaseException as exc:
            if case.get("raises") == type(exc).__name__:
                results.append([True, name, ""])
            else:
                results.append([False, name, "raised " + explain(exc)])
            continue
        if "raises" in case:
            results.append([False, name, f"expected it to raise {case['raises']}, but it returned {got!r}"])
            continue
        want = case["expect"]
        if case.get("unordered") and isinstance(got, list):
            ok = same(sorted(got, key=repr), sorted(want, key=repr))
        else:
            ok = same(got, want)
        results.append([ok, name, "" if ok else f"expected: {want!r}\ngot:      {got!r}"])

    if spec.get("tests"):
        try:
            tests = load(spec["tests"], "z2d_tests")
        except BaseException as exc:
            results.append([False, "test file loads", explain(exc)])
            finish()
        for attr, fn in list(vars(tests).items()):
            if not attr.startswith("test_") or not callable(fn):
                continue
            name = (fn.__doc__ or attr[5:].replace("_", " ")).strip().split("\n")[0]
            try:
                fn()
                results.append([True, name, ""])
            except AssertionError as exc:
                results.append([False, name, str(exc) or "an assertion failed"])
            except BaseException as exc:
                results.append([False, name, "raised " + explain(exc)])
finish()
'''


def check_pyfunc(ex, exdir):
    spec = dict(ex.spec)
    spec.setdefault("file", "solution.py")
    if not (exdir / spec["file"]).exists():
        return [Result(False, f"{spec['file']} exists")]
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    code, out, err = run([sys.executable, "-c", PYFUNC_RUNNER], cwd=exdir,
                         stdin=json.dumps(spec), timeout=ex.timeout, env=env)
    if code is None:
        return [Result(False, "finishes in time", f"timed out after {ex.timeout}s: is there an infinite loop?")]
    marker = out.rfind("@@Z2D@@")
    if marker < 0:
        return [Result(False, "tests run", clip(err or out or describe_exit(code), 20))]
    return [Result(ok, name, detail) for ok, name, detail in json.loads(out[marker + 7:])]


# ---------------------------------------------------------------- harness kind

def check_harness(ex, exdir):
    """Run a test file shipped with the exercise against the learner's code.

    If the test prints lines starting with "ok - " / "not ok - ", each becomes
    one result. Otherwise the exit code decides and the output is shown.
    """
    lang = ex.spec["lang"]
    require(lang)
    with tempfile.TemporaryDirectory() as tmp:
        def fill(cmd):
            return [part.replace("{build}", tmp) for part in cmd]

        if ex.spec.get("build"):
            code, out, err = run(fill(ex.spec["build"]), cwd=exdir, timeout=120)
            if code != 0:
                return [Result(False, "compiles", clip((err + out).strip() or describe_exit(code), 25, 3000))]
        code, out, err = run(fill(ex.spec["run"]), cwd=exdir, timeout=ex.timeout)
    results = []
    last = None
    for line in out.split("\n"):
        if line.startswith("ok - "):
            last = Result(True, line[5:].strip())
            results.append(last)
        elif line.startswith("not ok - "):
            name, _, detail = line[9:].partition(": ")
            last = Result(False, name.strip(), detail.strip())
            results.append(last)
    if code is None:
        results.append(Result(False, "finishes in time", f"timed out after {ex.timeout}s"))
    elif not results:
        output = (out + err).strip()
        results.append(Result(code == 0, "all tests pass", "" if code == 0 else clip(output, 40, 4000)))
    elif code != 0 and all(r.ok for r in results):
        results.append(Result(False, "test run completes", clip((err or out).strip() or describe_exit(code), 25, 3000)))
    return results


# ---------------------------------------------------------------- sql kind

def sql_value(v):
    """Values as text, so SQLite rows and psql CSV rows compare the same way."""
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "t" if v else "f"
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v)


def sql_rows_equal(got, want, ordered):
    def cell_equal(a, b):
        if a == b:
            return True
        try:
            return abs(float(a) - float(b)) < 1e-6
        except ValueError:
            return False

    if len(got) != len(want):
        return False
    if not ordered:
        got, want = sorted(got), sorted(want)
    return all(len(g) == len(w) and all(cell_equal(a, b) for a, b in zip(g, w))
               for g, w in zip(got, want))


def sql_table(columns, rows):
    lines = []
    if columns:
        lines.append(" | ".join(columns))
    lines += [" | ".join(r) for r in rows]
    return "\n".join(lines) if lines else "(no rows)"


def split_sql(text):
    """Split a script into statements (SQLite's own parser decides where they end)."""
    statements, current = [], ""
    for line in text.split("\n"):
        current += line + "\n"
        if sqlite3.complete_statement(current):
            if re.sub(r"--[^\n]*|\s|;", "", current):
                statements.append(current.strip())
            current = ""
    if re.sub(r"--[^\n]*|\s|;", "", current):
        statements.append(current.strip())
    return statements


class SqliteDb:
    def __init__(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("PRAGMA foreign_keys = ON")

    def script(self, text):
        """Run every statement; return (columns, rows) of the last one that returned rows."""
        columns, rows = [], []
        for statement in split_sql(text):
            cur = self.conn.execute(statement)
            if cur.description:
                columns = [d[0] for d in cur.description]
                rows = [[sql_value(v) for v in r] for r in cur.fetchall()]
        self.conn.commit()
        return columns, rows

    def close(self):
        self.conn.close()


class PostgresDb:
    def __init__(self):
        for tool in ("psql", "pg_isready"):
            if shutil.which(tool) is None:
                raise Skip("this exercise needs PostgreSQL. Install with: setup/install.sh --stack postgres")
        code, _, _ = run(["pg_isready", "-q"], timeout=10)
        if code != 0:
            raise Skip("PostgreSQL is not running. Start it with: sudo service postgresql start")
        self.name = "z2d_" + uuid.uuid4().hex[:12]
        code, _, err = self._psql("postgres", f'CREATE DATABASE "{self.name}"')
        if code != 0:
            raise Skip("cannot create a scratch database: " + err.strip().split("\n")[0]
                       + "\n      Run setup/install.sh --stack postgres to create a role for your user.")

    def _psql(self, db, sql):
        return run(["psql", "-X", "-q", "--csv", "-P", "null=NULL", "-v", "ON_ERROR_STOP=1", "-d", db],
                   stdin=sql, timeout=30)

    def script(self, text):
        code, out, err = self._psql(self.name, text)
        if code != 0:
            raise sqlite3.Error(err.strip() or "psql failed")
        # With several result sets psql prints them one after another; the
        # exercises that compare a result ask for a single query, so the output is one table.
        table = list(csv.reader(io.StringIO(out)))
        if not table:
            return [], []
        return table[0], table[1:]

    def close(self):
        self._psql("postgres", f'DROP DATABASE IF EXISTS "{self.name}" WITH (FORCE)')


def check_sql(ex, exdir):
    spec = ex.spec
    fname = spec.get("file", "query.sql")
    path = exdir / fname
    if not path.exists():
        return [Result(False, f"{fname} exists")]
    text = path.read_text(encoding="utf-8")
    if not re.sub(r"--[^\n]*|\s|;", "", text):
        return [Result(False, f"{fname} contains a query", f"{fname} is empty. Write your SQL in it.")]

    db = PostgresDb() if spec.get("engine") == "postgres" else SqliteDb()
    results = []
    try:
        if spec.get("seed"):
            db.script((exdir / spec["seed"]).read_text(encoding="utf-8"))
        try:
            columns, rows = db.script(text)
        except sqlite3.Error as exc:
            return [Result(False, f"{fname} runs without errors", str(exc))]
        results.append(Result(True, f"{fname} runs without errors"))

        expect = spec.get("expect")
        if expect:
            want_rows = [[sql_value(v) for v in r] for r in expect["rows"]]
            want_cols = expect.get("columns")
            got_cols = [c.lower() for c in columns]
            if want_cols and got_cols != [c.lower() for c in want_cols]:
                results.append(Result(False, "result has the right columns",
                                      f"expected: {', '.join(want_cols)}\ngot:      {', '.join(columns) or '(none)'}"))
            else:
                ordered = expect.get("ordered", False)
                ok = sql_rows_equal(rows, want_rows, ordered)
                label = "result rows match" + (" (order matters)" if ordered else "")
                detail = "" if ok else (block("expected:", sql_table(want_cols, want_rows)) + "\n"
                                        + block("got:     ", sql_table(columns, rows)))
                results.append(Result(ok, label, detail))

        for chk in spec.get("checks", []):
            try:
                cols, got = db.script(chk["query"])
            except sqlite3.Error as exc:
                ok = bool(chk.get("error"))
                results.append(Result(ok, chk["name"], "" if ok else str(exc)))
                continue
            if chk.get("error"):
                results.append(Result(False, chk["name"], "this statement should be rejected, but it succeeded"))
                continue
            want = [[sql_value(v) for v in r] for r in chk.get("rows", [])]
            ok = sql_rows_equal(got, want, chk.get("ordered", False))
            detail = "" if ok else (block("expected:", sql_table([], want)) + "\n"
                                    + block("got:     ", sql_table(cols, got)))
            results.append(Result(ok, chk["name"], detail))
    finally:
        db.close()
    return results


# ---------------------------------------------------------------- sandbox kind

def setup_sandbox(ex, sandbox):
    """Create the working directory for a git/shell exercise and run its setup."""
    sandbox.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, Z2D_EX=str(ex.dir),
               GIT_AUTHOR_NAME="zero2dev", GIT_AUTHOR_EMAIL="setup@zero2dev.invalid",
               GIT_COMMITTER_NAME="zero2dev", GIT_COMMITTER_EMAIL="setup@zero2dev.invalid")
    for cmd in ex.spec.get("setup", []):
        code, out, err = run(["bash", "-c", cmd], cwd=sandbox, timeout=60, env=env)
        if code != 0:
            raise RuntimeError(f"setup step failed: {cmd}\n{err or out}")


def check_sandbox(ex, sandbox):
    results = []
    for chk in ex.spec["checks"]:
        code, out, err = run(["bash", "-c", chk["cmd"]], cwd=sandbox, timeout=ex.timeout)
        out = out.strip()
        ok = code == chk.get("exit", 0)
        if ok and "stdout" in chk:
            ok = norm(out) == norm(chk["stdout"])
        if ok and "contains" in chk:
            ok = chk["contains"] in out
        if ok and "regex" in chk:
            ok = re.search(chk["regex"], out, re.M) is not None
        if ok and "min" in chk:
            ok = out.isdigit() and int(out) >= chk["min"]
        detail = "" if ok else chk.get("fail", "")
        results.append(Result(ok, chk["name"], detail))
    return results


# ---------------------------------------------------------------- dispatch

def run_checks(ex, exdir=None, sandbox=None, lang=None):
    """Run one exercise. Pure: touches no progress files. Raises Skip."""
    exdir = exdir or ex.dir
    if ex.kind == "program":
        return check_program(ex, exdir, lang)
    if ex.kind == "pyfunc":
        return check_pyfunc(ex, exdir)
    if ex.kind == "harness":
        return check_harness(ex, exdir)
    if ex.kind == "sql":
        return check_sql(ex, exdir)
    if ex.kind == "sandbox":
        return check_sandbox(ex, sandbox or ex.sandbox)
    raise Skip(f"unknown exercise kind: {ex.kind}")


# ---------------------------------------------------------------- progress

def load_progress():
    try:
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    if PROGRESS_JS.parent.is_dir():
        passed = {k: v["passed_at"] for k, v in progress.items() if v.get("passed")}
        payload = {"passed": passed, "updated": now()}
        PROGRESS_JS.write_text("window.Z2D_PROGRESS = " + json.dumps(payload, sort_keys=True) + ";\n",
                               encoding="utf-8")


def now():
    return datetime.datetime.now().replace(microsecond=0).isoformat()


# ---------------------------------------------------------------- commands

def rel(path):
    try:
        return str(Path(path).relative_to(Path.cwd()))
    except ValueError:
        return str(path)


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


def run_and_report(ex, progress, lang=None):
    """Returns True (passed), False (failed) or None (skipped)."""
    print(bold(f"{ex.id}") + f"  {ex.title}")
    if ex.kind == "sandbox" and not ex.sandbox.exists():
        setup_sandbox(ex, ex.sandbox)
        print(f"  Your working folder for this exercise is ready:\n\n      cd {ex.sandbox}\n")
        print(f"  Do the task there ({rel(ex.dir / 'README.md')}), then run this command again.\n")
        return None
    try:
        results = run_checks(ex, lang=lang)
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
    entry = progress.setdefault(ex.id, {"attempts": 0})
    entry["attempts"] = entry.get("attempts", 0) + 1
    good = sum(1 for r in results if r.ok)
    if passed:
        if not entry.get("passed"):
            entry["passed"] = True
            entry["passed_at"] = now()
        print(green(f"  PASSED {good}/{len(results)}") + "\n")
    else:
        fails = entry["fails"] = entry.get("fails", 0) + 1
        print(red(f"  FAILED {good}/{len(results)} passed"))
        hints = ex.spec.get("hints", [])
        if hints and fails >= 2:
            index = min(fails - 2, len(hints) - 1)
            print(f"  Hint: {hints[index]}")
        elif hints:
            print(dim(f"  Stuck? python3 check.py hint {ex.id}"))
        if ex.kind == "sandbox":
            print(dim(f"  Working folder: {ex.sandbox}"))
        print()
    save_progress(progress)
    return passed


def cmd_run(selectors, lang):
    exercises = load_exercises()
    chosen = []
    for sel in selectors:
        chosen += exercises if sel == "all" else resolve(sel, exercises)
    progress = load_progress()
    outcomes = [run_and_report(ex, progress, lang) for ex in chosen]
    if len(chosen) > 1:
        print(bold(f"{outcomes.count(True)} passed, {outcomes.count(False)} failed, "
                   f"{outcomes.count(None)} skipped"))
    return 1 if False in outcomes else 0


def cmd_list():
    progress = load_progress()
    track = None
    for ex in load_exercises():
        if ex.track != track:
            track = ex.track
            print(bold(f"\n{track}"))
        mark = green(OK_MARK) if progress.get(ex.id, {}).get("passed") else dim("·")
        print(f"  {mark} {ex.id:<34} {ex.title}")
    print()
    return 0


def cmd_progress():
    progress = load_progress()
    exercises = load_exercises()
    total_done = 0
    for track in dict.fromkeys(e.track for e in exercises):
        items = [e for e in exercises if e.track == track]
        done = sum(1 for e in items if progress.get(e.id, {}).get("passed"))
        total_done += done
        width = 24
        filled = round(width * done / len(items))
        print(f"  {track:<8} {'#' * filled}{'.' * (width - filled)} {done}/{len(items)}")
    print(bold(f"\n  {total_done}/{len(exercises)} exercises passed"))
    return 0


def cmd_next():
    progress = load_progress()
    for ex in load_exercises():
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
    for ex in resolve(selector, load_exercises()):
        hints = ex.spec.get("hints", [])
        print(bold(ex.id) + f"  {ex.title}")
        if not hints:
            print("  No hints for this one. Re-read the lesson and the task.")
        for i, hint in enumerate(hints, 1):
            print(f"  {i}. {hint}")
    return 0


def cmd_start(selector, lang):
    for ex in resolve(selector, load_exercises()):
        if ex.kind == "sandbox":
            if ex.sandbox.exists():
                print(f"{ex.id}: working folder already exists: {ex.sandbox}")
            else:
                setup_sandbox(ex, ex.sandbox)
                print(f"{ex.id}: working folder ready: {ex.sandbox}")
            continue
        if ex.kind != "program" or ex.spec.get("lang", "any") != "any":
            print(f"{ex.id}: edit the files in {rel(ex.dir)}")
            continue
        if not lang:
            sys.exit(f"Pick a language: python3 check.py start {ex.id} --lang <{'|'.join(LANGS)}>")
        if lang not in LANGS:
            sys.exit(f"Unknown language '{lang}'. Known: {', '.join(LANGS)}")
        target = ex.dir / LANGS[lang]["file"]
        if target.exists():
            print(f"{ex.id}: {rel(target)} already exists, left as it is")
        else:
            target.write_text(LANGS[lang]["starter"], encoding="utf-8")
            print(f"{ex.id}: created {rel(target)}")
        print(f"  Check with: python3 check.py {ex.id} --lang {lang}")
    return 0


def cmd_reset(selector):
    for ex in resolve(selector, load_exercises()):
        if ex.kind != "sandbox":
            print(f"{ex.id}: to restore the starter files run: git checkout -- {rel(ex.dir)}")
            continue
        if ex.sandbox.exists():
            shutil.rmtree(ex.sandbox)
        setup_sandbox(ex, ex.sandbox)
        print(f"{ex.id}: working folder recreated: {ex.sandbox}")
    return 0


def cmd_doctor():
    def version(cmd):
        try:
            code, out, err = run(cmd, timeout=20)
        except Skip:
            return None
        lines = [line for line in (out + err).strip().split("\n") if line.strip()]
        return lines[0].strip() if code == 0 and lines else None

    probes = [
        ("C", ["gcc", "--version"], "core"),
        ("git", ["git", "--version"], "core"),
        ("Python", [sys.executable, "--version"], "python"),
        ("Java", ["javac", "-version"], "java"),
        ("Elixir", ["elixir", "--short-version"], "elixir"),
        ("Node.js", ["node", "--version"], "node"),
        ("Go", ["go", "version"], "go"),
        ("Rust", ["rustc", "--version"], "rust"),
        ("Ruby", ["ruby", "--version"], "ruby"),
        ("PostgreSQL", ["psql", "--version"], "postgres"),
    ]
    print(bold("Toolchains"))
    for name, cmd, stack in probes:
        found = version(cmd)
        if found:
            print(f"  {green(OK_MARK)} {name:<11} {found}")
        else:
            print(f"  {dim(SKIP_MARK)} {name:<11} not installed   (setup/install.sh --stack {stack})")
    if shutil.which("pg_isready"):
        code, _, _ = run(["pg_isready", "-q"], timeout=10)
        state = green("running") if code == 0 else yellow("not running (sudo service postgresql start)")
        print(f"    PostgreSQL server: {state}")
    print(f"  {green(OK_MARK)} {'SQLite':<11} {sqlite3.sqlite_version} (built into Python, nothing to install)")
    print(f"\n  Sanitizers for C exercises: {'on' if shutil.which('gcc') and sanitizers_work() else 'off'}")
    print(f"  Working folders for git/shell exercises: {WORK_ROOT}")
    return 0


def main(argv):
    lang = None
    if "--lang" in argv:
        i = argv.index("--lang")
        if i + 1 >= len(argv):
            sys.exit("--lang needs a value, for example: --lang java")
        lang = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(__doc__.strip())
        return 0
    command, rest = argv[0], argv[1:]
    simple = {"list": cmd_list, "progress": cmd_progress, "next": cmd_next, "doctor": cmd_doctor}
    if command in simple:
        return simple[command]()
    if command in ("hint", "reset", "start"):
        if not rest:
            sys.exit(f"Usage: python3 check.py {command} <exercise>")
        if command == "hint":
            return cmd_hint(rest[0])
        if command == "reset":
            return cmd_reset(rest[0])
        return cmd_start(rest[0], lang)
    return cmd_run(argv, lang)


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except KeyboardInterrupt:
        sys.exit(130)
