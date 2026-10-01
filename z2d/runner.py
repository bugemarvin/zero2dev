"""The exercise kinds: program, pyfunc, harness, sql, sandbox, http.

run_checks() is pure: it runs an exercise and returns a list of Result objects.
It never touches progress files. It raises Skip when something is missing.
"""
import csv
import io
import json
import os
import re
import shutil
import signal
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

from . import core, providers, services, toolchains, workspaces
from .core import Result, Skip, block, clip, describe_exit, norm
from .pyfunc_runner import PYFUNC_RUNNER
from .toolchains import LANGS


# ---------------------------------------------------------------- which files

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


def editable_files(ex, lang=None):
    """The files a learner is meant to change, in display order."""
    spec = ex.spec
    if "edit" in spec:
        return list(spec["edit"])
    if ex.kind == "program":
        if spec.get("sources"):
            return [s for s in spec["sources"] if not s.startswith("test_")]
        chosen = lang if spec.get("lang", "any") == "any" else spec["lang"]
        return [LANGS[chosen or "python"]["file"]]
    if ex.kind == "pyfunc":
        return [spec.get("file", "solution.py")]
    if ex.kind == "sql":
        return [spec.get("file", "query.sql")]
    if ex.kind == "harness":
        if spec.get("lang") == "elixir":
            return ["solution.ex"]
        return [part for part in spec.get("build", []) if part.endswith(".java") and part != "Tests.java"]
    return []


# ---------------------------------------------------------------- program kind

def case_stdin(case):
    """The input of a test case.

    Large inputs are not stored. "stdin_py" holds a Python expression that
    builds the text, so a 200,000-number test costs one line in exercise.json.
    """
    if "stdin_py" in case:
        return eval(case["stdin_py"], {})
    return case.get("stdin", "")


def check_program(ex, exdir, lang_override=None):
    lang = pick_language(ex, exdir, lang_override)
    sources = ex.spec.get("sources") or [LANGS[lang]["file"]]
    for s in sources:
        if not (exdir / s).exists():
            return [Result(False, f"{s} exists", f"Create it with: python3 check.py start {ex.id} --lang {lang}")]
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        outdir = Path(tmp)
        env = toolchains.open_env(lang, exdir, outdir)
        try:
            built, runner, run_env = toolchains.build(lang, sources, env, ex.spec.get("main", "Main"))
            if built is not None:
                results.append(built)
                if not built.ok:
                    return results
            for i, case in enumerate(ex.spec["cases"], 1):
                name = case.get("name", f"case {i}")
                rundir = outdir / f"run{i}"
                rundir.mkdir()
                for fname, content in case.get("files", {}).items():
                    (rundir / fname).write_text(content, encoding="utf-8")
                stdin = case_stdin(case)
                code, out, err = env.run(runner + case.get("args", []), cwd=env.out(f"run{i}"),
                                         stdin=stdin, timeout=ex.timeout, env=run_env)
                want_exit = case.get("exit", 0)
                parts = []
                if stdin:
                    parts.append(block("input:   ", stdin, 8, 300))
                if case.get("args"):
                    parts.append(block("args:    ", " ".join(case["args"])))
                if code is None:
                    parts.append(f"the program did not finish within {ex.timeout} seconds: "
                                 "too slow for this input, or an infinite loop")
                    results.append(Result(False, name, "\n".join(parts)))
                    continue
                if code != want_exit:
                    parts.append(f"the program {describe_exit(code)}, expected exit code {want_exit}")
                    if out.strip():
                        parts.append(block("stdout:  ", norm(out)))
                    if err.strip():
                        parts.append(block("stderr:  ", err))
                    results.append(Result(False, name, "\n".join(parts)))
                    continue
                if "then" in case:
                    # a follow-up command, run where the program ran: checks files it created
                    then_code, then_out, then_err = core.run(["bash", "-c", case["then"]], cwd=rundir, timeout=30)
                    if then_code != 0:
                        parts.append(case.get("then_fail", "the files the program should have produced are not right"))
                        if (then_out + then_err).strip():
                            parts.append(block("details: ", then_out + then_err))
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
        finally:
            env.close()
    return results


# ---------------------------------------------------------------- pyfunc kind

def check_pyfunc(ex, exdir):
    spec = dict(ex.spec)
    spec.setdefault("file", "solution.py")
    if not (exdir / spec["file"]).exists():
        return [Result(False, f"{spec['file']} exists")]
    env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
    code, out, err = core.run([sys.executable, "-c", PYFUNC_RUNNER], cwd=exdir,
                              stdin=json.dumps(spec), timeout=ex.timeout, env=env)
    if code is None:
        return [Result(False, "finishes in time", f"timed out after {ex.timeout}s: is there an infinite loop?")]
    marker = out.rfind("@@Z2D@@")
    if marker < 0:
        return [Result(False, "tests run", clip(err or out or describe_exit(code), 20))]
    return [Result(ok, name, detail) for ok, name, detail in json.loads(out[marker + 7:])]


# ---------------------------------------------------------------- test output (TAP)

TAP_LINE = re.compile(r"^\s*(not ok|ok)\s+(?:\d+\s+)?-\s+(.*)$")


def _yaml_lite(lines):
    """Read the flat `key: value` pairs of a TAP diagnostic block, including `key: |-` blocks."""
    info = {}
    indent = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or len(line) - len(line.lstrip()) != indent or ":" not in line:
            continue
        key, _, value = line.strip().partition(":")
        value = value.strip()
        if value in ("|-", "|", ">-", ">"):
            body = []
            while i < len(lines) and (not lines[i].strip() or len(lines[i]) - len(lines[i].lstrip()) > indent):
                body.append(lines[i].strip())
                i += 1
            value = "\n".join(body).strip()
        elif len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        info[key.strip()] = value
    return info


ANSI = re.compile(r"\x1b\[[0-9;]*m")


def _diagnosis(body):
    """The useful part of a TAP diagnostic block: the message, and expected/actual when they are simple."""
    text = ANSI.sub("", "\n".join(body))
    quoted = re.search(r'^\s*message:\s*"((?:[^"\\]|\\.)*)"', text, re.M | re.S)     # Vitest
    info = _yaml_lite(body)
    if quoted:
        message = quoted.group(1).replace('\\"', '"').replace("\\n", "\n")
    else:
        message = ANSI.sub("", info.get("error") or info.get("message") or "")
    parts = [message.strip()]
    values = {}
    for key in ("expected", "actual"):
        found = re.search(r"^\s*" + key + r":\s*(\S.*)$", text, re.M)
        if found and found.group(1) not in ("|-", "|", ">-", ">"):
            values[key] = found.group(1).strip().strip("'\"")
    if len(values) == 2 and values["expected"] not in message:
        parts += [f"expected: {values['expected']}", f"got:      {values['actual']}"]
    return "\n".join(p for p in parts if p)


def parse_tap(text):
    """Turn `ok - name` / `not ok 3 - name` lines into results.

    Accepts the simple form the bundled test drivers print (`not ok - name: reason`)
    and real TAP with a YAML block, as produced by `node --test` and Vitest.
    """
    results = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        match = TAP_LINE.match(lines[i])
        i += 1
        if not match:
            continue
        ok = match.group(1) == "ok"
        name = re.sub(r"\s+#\s*(SKIP|TODO|time=).*$", "", match.group(2).strip())
        detail = ""
        if i < len(lines) and lines[i].strip() == "---":
            body = []
            i += 1
            while i < len(lines) and lines[i].strip() != "...":
                body.append(lines[i])
                i += 1
            i += 1
            if _yaml_lite(body).get("type") == "suite":
                continue
            if not ok:
                detail = _diagnosis(body)
        elif not ok and ": " in name:
            name, _, detail = name.partition(": ")
        if " > " in name:                      # Vitest prefixes the file name
            name = name.split(" > ", 1)[1]
        results.append(Result(ok, name.strip(), clip(detail.strip(), 14, 1100)))
    return results


# ---------------------------------------------------------------- harness kind

def check_harness(ex, exdir):
    """Run a test file shipped with the exercise against the learner's code.

    With "workspace", the exercise is copied into a prepared dependency folder
    (for example one with React installed) and the tests run there.
    """
    lang = ex.spec["lang"]
    workspace = ex.spec.get("workspace")
    with tempfile.TemporaryDirectory() as tmp:
        outdir = Path(tmp)
        if workspace:
            root, rel = workspaces.stage(workspace, ex, exdir)
            env = toolchains.open_env(lang, root, outdir, writable=True)
            cwd = env.ex(rel)
        else:
            env = toolchains.open_env(lang, exdir, outdir)
            cwd = env.ex()
        try:
            def fill(cmd):
                return [part.replace("{build}", env.out()).replace("{ex}", cwd) for part in cmd]

            if ex.spec.get("build"):
                code, out, err = env.run(fill(ex.spec["build"]), cwd=cwd, timeout=180)
                if code != 0:
                    return [Result(False, "compiles", clip((err + out).strip() or describe_exit(code), 25, 3000))]
            run_env = dict({"NO_COLOR": "1", "FORCE_COLOR": "0", "CI": "1"}, **ex.spec.get("env", {}))
            code, out, err = env.run(fill(ex.spec["run"]), cwd=cwd, timeout=ex.timeout, env=run_env)
        finally:
            env.close()
            if workspace:
                workspaces.unstage(root, rel)
    results = parse_tap(out)
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
    """Split a script into statements at semicolons, ignoring those inside quotes and comments."""
    statements, current = [], []
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if ch in "'\"":                                   # quoted text: copy up to the closing quote
            j = i + 1
            while j < n and text[j] != ch:
                j += 1
            current.append(text[i:j + 1])
            i = j + 1
        elif text.startswith("--", i):                    # comment to the end of the line
            j = text.find("\n", i)
            i = n if j < 0 else j
        elif text.startswith("/*", i):                    # block comment
            j = text.find("*/", i + 2)
            i = n if j < 0 else j + 2
        elif ch == ";":
            statements.append("".join(current).strip())
            current = []
            i += 1
        else:
            current.append(ch)
            i += 1
    statements.append("".join(current).strip())
    return [st for st in statements if st]


class SqliteDb:
    def __init__(self):
        # isolation_level=None: no implicit transactions, so the learner's own
        # BEGIN / COMMIT / ROLLBACK behave as they do in a database shell.
        self.conn = sqlite3.connect(":memory:", isolation_level=None)
        self.conn.execute("PRAGMA foreign_keys = ON")

    def script(self, text):
        """Run every statement; return (columns, rows) of the last one that returned rows."""
        columns, rows = [], []
        for statement in split_sql(text):
            cur = self.conn.execute(statement)
            if cur.description:
                columns = [d[0] for d in cur.description]
                rows = [[sql_value(v) for v in r] for r in cur.fetchall()]
        return columns, rows

    def close(self):
        self.conn.close()


class PostgresDb:
    """A scratch database on the machine's own PostgreSQL, or on the z2d-postgres container."""

    def __init__(self):
        self.prefix, self.where = services.postgres_client()
        self.name = "z2d_" + uuid.uuid4().hex[:12]
        code, _, err = self._psql("postgres", f'CREATE DATABASE "{self.name}"')
        if code != 0 and self.where == "native":
            # The local server refused (no permission to create databases): use Docker instead.
            services.up("postgres")
            self.prefix = ["docker", "exec", "-i", services.container("postgres"), "psql", "-U", "postgres"]
            self.where = "docker"
            code, _, err = self._psql("postgres", f'CREATE DATABASE "{self.name}"')
        if code != 0:
            first = (err or "").strip().split("\n")[0]
            raise Skip(f"cannot create a scratch database: {first}")

    def _psql(self, db, sql):
        return core.run(self.prefix + ["-X", "-q", "--csv", "-P", "null=NULL", "-v", "ON_ERROR_STOP=1", "-d", db],
                        stdin=sql, timeout=60)

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
        code, _, _ = self._psql("postgres", f'DROP DATABASE IF EXISTS "{self.name}" WITH (FORCE)')
        if code != 0:  # PostgreSQL 12 and older have no FORCE option
            self._psql("postgres", f'DROP DATABASE IF EXISTS "{self.name}"')


def open_db(spec):
    return PostgresDb() if spec.get("engine") == "postgres" else SqliteDb()


def sql_is_empty(text):
    return not re.sub(r"--[^\n]*|\s|;", "", text)


def check_sql(ex, exdir):
    spec = ex.spec
    fname = spec.get("file", "query.sql")
    path = exdir / fname
    if not path.exists():
        return [Result(False, f"{fname} exists")]
    text = path.read_text(encoding="utf-8")
    if sql_is_empty(text):
        return [Result(False, f"{fname} contains a query", f"{fname} is empty. Write your SQL in it.")]

    db = open_db(spec)
    results = []
    try:
        if spec.get("seed"):
            db.script((exdir / spec["seed"]).read_text(encoding="utf-8"))
        try:
            columns, rows = db.script(text)
        except sqlite3.Error as exc:
            return [Result(False, f"{fname} runs without errors", str(exc))]
        results.append(Result(True, f"{fname} runs without errors"))

        plain = re.sub(r"--[^\n]*", "", text).lower()
        for word in spec.get("require", []):
            found = re.search(r"\b" + re.escape(word.lower()) + r"\b", plain) is not None
            results.append(Result(found, f"uses {word.upper()}",
                                  "" if found else f"{fname} must use {word.upper()} for this exercise"))

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


def show_sql(ex, exdir=None):
    """Run a SQL exercise's query on its sample data. Returns (columns, rows) or raises sqlite3.Error."""
    exdir = exdir or ex.dir
    spec = ex.spec
    db = open_db(spec)
    try:
        if spec.get("seed"):
            db.script((exdir / spec["seed"]).read_text(encoding="utf-8"))
        return db.script((exdir / spec.get("file", "query.sql")).read_text(encoding="utf-8"))
    finally:
        db.close()


# ---------------------------------------------------------------- sandbox kind

SETUP_ENV = {"GIT_AUTHOR_NAME": "zero2dev", "GIT_AUTHOR_EMAIL": "setup@zero2dev.invalid",
             "GIT_COMMITTER_NAME": "zero2dev", "GIT_COMMITTER_EMAIL": "setup@zero2dev.invalid"}


def setup_sandbox(ex, sandbox):
    """Create the working directory for a git/shell exercise and run its setup."""
    sandbox.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, Z2D_EX=str(ex.dir), **SETUP_ENV)
    for cmd in ex.spec.get("setup", []):
        code, out, err = core.run(["bash", "-c", cmd], cwd=sandbox, timeout=120, env=env)
        if code != 0:
            raise RuntimeError(f"setup step failed: {cmd}\n{err or out}")


def check_sandbox(ex, sandbox):
    for tool in ex.spec.get("needs", []):
        if shutil.which(tool) is None:
            raise Skip(f"this exercise needs {tool} on this machine")
    if "docker" in ex.spec.get("needs", []) and providers.docker_state() != "ok":
        raise Skip(providers.DOCKER_HELP[providers.docker_state()])
    results = []
    for chk in ex.spec["checks"]:
        code, out, err = core.run(["bash", "-c", chk["cmd"]], cwd=sandbox, timeout=ex.timeout)
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
        results.append(Result(ok, chk["name"], "" if ok else chk.get("fail", "")))
    return results


# ---------------------------------------------------------------- http kind

def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for_port(port, seconds, alive=lambda: True):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if not alive():
            return False
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.25)
    return False


def json_contains(got, want):
    """True when `want` is a subset of `got`: every key and element asked for is there."""
    if isinstance(want, dict):
        return isinstance(got, dict) and all(k in got and json_contains(got[k], v) for k, v in want.items())
    if isinstance(want, list):
        return isinstance(got, list) and len(got) == len(want) and all(json_contains(g, w) for g, w in zip(got, want))
    return got == want


def http_request(port, req, timeout):
    data = None
    headers = dict(req.get("headers", {}))
    if "raw" in req:                       # a body sent exactly as written, for testing bad input
        data = req["raw"].encode()
    elif "body" in req:
        data = json.dumps(req["body"]).encode()
        headers.setdefault("Content-Type", "application/json")
    request = urllib.request.Request(f"http://127.0.0.1:{port}{req['path']}", data=data,
                                     method=req.get("method", "GET"), headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as resp:
            return resp.status, dict(resp.headers), resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers), exc.read().decode("utf-8", "replace")


def request_when_ready(port, req, timeout, patience):
    """Send a request, retrying for a while if the connection is refused or dropped.

    A published container port accepts connections a moment before the program
    behind it is ready, so the first attempts can fail without anything being wrong.
    """
    deadline = time.time() + patience
    while True:
        try:
            return http_request(port, req, timeout)
        except (ConnectionError, urllib.error.URLError, OSError) as exc:
            if isinstance(exc, urllib.error.HTTPError) or time.time() > deadline:
                raise
            time.sleep(0.5)


def judge_response(req, status, headers, body):
    """Compare one response with what the exercise expects. Returns '' or a failure description."""
    problems = []
    if "status" in req and status != req["status"]:
        problems.append(f"expected status {req['status']}, got {status}")
    for key, value in req.get("header", {}).items():
        got = next((v for k, v in headers.items() if k.lower() == key.lower()), None)
        if got is None or value.lower() not in got.lower():
            problems.append(f"expected header {key} to contain {value!r}, got {got!r}")
    wanted = req.get("contains", [])
    for text in [wanted] if isinstance(wanted, str) else wanted:
        if text not in body:
            problems.append(f"the response should contain: {text}")
    unwanted = req.get("not_contains", [])
    for text in [unwanted] if isinstance(unwanted, str) else unwanted:
        if text in body:
            problems.append(f"the response should not contain: {text}")
    if "json" in req or "json_contains" in req:
        try:
            parsed = json.loads(body)
        except ValueError:
            problems.append("the response is not valid JSON")
        else:
            if "json" in req and parsed != req["json"]:
                problems.append(f"expected JSON: {json.dumps(req['json'])}")
            if "json_contains" in req and not json_contains(parsed, req["json_contains"]):
                problems.append(f"the JSON should include: {json.dumps(req['json_contains'])}")
    if problems:
        shown = body
        if re.match(r"\s*<(!doctype|html)", body, re.I):
            # an HTML error page: show its text on one line, not the markup
            shown = "(an HTML page) " + " ".join(re.sub(r"<[^>]+>", " ", body).split())
        problems.append(block("response:", f"{status} {shown}", 10, 400))
    return "\n".join(problems)


class App:
    """A running app for an http exercise: a dev server process, or a Compose-style up/down pair."""

    def __init__(self, ex, exdir, spec=None):
        spec = spec or ex.spec
        self.spec = spec
        self.port = free_port()
        self.proc = None
        self.log = None
        lang = spec.get("lang", "javascript")
        if not providers.native_ok(LANGS[lang]["needs"]) and "start" in spec:
            info = LANGS[lang]
            raise Skip(f"{info['name']} needs {', '.join(info['needs'])} installed on this machine to run an app. "
                       f"Install with: setup/install.sh --stack {info['stack']}")
        for tool in spec.get("needs", []):
            if shutil.which(tool) is None:
                raise Skip(f"this exercise needs {tool} on this machine")
        if "docker" in spec.get("needs", []) and providers.docker_state() != "ok":
            raise Skip(providers.DOCKER_HELP[providers.docker_state()])
        self.staged = None
        if spec.get("workspace"):
            root, rel = workspaces.stage(spec["workspace"], ex, exdir)
            self.staged = (root, rel)
            self.cwd = root / rel
        else:
            self.cwd = exdir
        self.env = dict(os.environ, PORT=str(self.port), HOST="127.0.0.1", **spec.get("env", {}))

    def fill(self, cmd):
        return [part.replace("{port}", str(self.port)) for part in cmd]

    def start(self):
        """Returns '' when the app is listening, otherwise a description of what went wrong."""
        seconds = self.spec.get("start_timeout", 40)
        if "up" in self.spec:
            code, out, err = core.run(self.fill(self.spec["up"]), cwd=self.cwd, timeout=900, env=self.env)
            if code != 0:
                return clip((err + out).strip() or describe_exit(code), 25, 3000)
            alive = lambda: True
        else:
            self.log = tempfile.TemporaryFile(mode="w+")
            try:
                self.proc = subprocess.Popen(self.fill(self.spec["start"]), cwd=self.cwd, env=self.env,
                                             stdin=subprocess.DEVNULL, stdout=self.log, stderr=subprocess.STDOUT,
                                             start_new_session=True)
            except FileNotFoundError:
                raise Skip(f"command not found: {self.spec['start'][0]}")
            alive = lambda: self.proc.poll() is None
        if wait_for_port(self.port, seconds, alive):
            return ""
        return (f"nothing was listening on the port after {seconds} seconds. The app must listen on the port "
                f"given in the PORT environment variable.\n" + block("output:", self.output(), 20, 2500))

    def output(self):
        if self.log is None:
            return ""
        self.log.flush()
        self.log.seek(0)
        return self.log.read()[-6000:]

    def stop(self):
        if self.proc is not None and self.proc.poll() is None:
            try:
                os.killpg(self.proc.pid, signal.SIGTERM)
                self.proc.wait(timeout=8)
            except (ProcessLookupError, PermissionError):
                pass
            except subprocess.TimeoutExpired:
                os.killpg(self.proc.pid, signal.SIGKILL)
        if "down" in self.spec:
            core.run(self.fill(self.spec["down"]), cwd=self.cwd, timeout=300, env=self.env)
        if self.log is not None:
            self.log.close()
            self.log = None
        if self.staged:
            workspaces.unstage(*self.staged)
            self.staged = None


def check_http(ex, exdir):
    app = App(ex, exdir)
    results = []
    try:
        problem = app.start()
        results.append(Result(not problem, "the app starts", problem))
        if problem:
            return results
        for req in ex.spec["requests"]:
            name = req.get("name") or f"{req.get('method', 'GET')} {req['path']}"
            try:
                status, headers, body = request_when_ready(app.port, req, ex.timeout,
                                                           ex.spec.get("ready_timeout", 20))
            except (OSError, ValueError) as exc:
                results.append(Result(False, name, f"the request failed: {exc}\n" + block("output:", app.output(), 12, 1500)))
                continue
            problem = judge_response(req, status, headers, body)
            # "retry": keep asking for that many seconds, for results that arrive later (a queue, a worker)
            deadline = time.time() + req.get("retry", 0)
            while problem and time.time() < deadline:
                time.sleep(0.5)
                try:
                    status, headers, body = http_request(app.port, req, ex.timeout)
                except (OSError, ValueError):
                    continue
                problem = judge_response(req, status, headers, body)
            results.append(Result(not problem, name, problem))
    finally:
        app.stop()
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
    if ex.kind == "http":
        return check_http(ex, exdir)
    raise Skip(f"unknown exercise kind: {ex.kind}")
