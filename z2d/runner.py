"""The exercise kinds: program, pyfunc, harness, sql, sandbox, http, web, mongo, redis.

run_checks() is pure: it runs an exercise and returns a list of Result objects.
It never touches progress files. It raises Skip when something is missing.
"""
import csv
import io
import json
import os
import re
import shlex
import shutil
import signal
import socket
import sqlite3
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

from . import core, providers, services, toolchains, webcheck, workspaces
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
    if ex.kind == "mongo":
        return [spec.get("file", "query.js")]
    if ex.kind == "redis":
        return [spec.get("file", "commands.redis")]
    if ex.kind == "web":
        return [spec.get("page", "index.html")] + list(spec.get("styles", [])) + list(spec.get("compile", {}))
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


def wait_for_http(port, seconds, alive=lambda: True):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if not alive():
            return False
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=2).close()
            return True
        except urllib.error.HTTPError:
            return True                     # any HTTP answer, even 404, means the app is up
        except (OSError, ValueError):
            time.sleep(0.4)
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
    """A running app for an http exercise: a dev server process, or a Compose-style up/down pair.

    A `start` command runs with the machine's own toolchain when it is installed,
    and otherwise in a container of the language's image, with the port published
    on 127.0.0.1. The app gets PORT, HOST and DATA_DIR (an empty folder that is
    removed afterwards) in its environment.
    """

    def __init__(self, ex, exdir, spec=None):
        spec = spec or ex.spec
        self.spec = spec
        self.port = free_port()
        self.proc = None
        self.log = None
        self.container = None
        self.image = None
        self.cache = None
        self.data = None
        lang = spec.get("lang", "javascript")
        info = LANGS[lang]
        if "start" in spec:
            how = providers.choose(info["name"], info["needs"], None if spec.get("workspace") else info.get("image"),
                                   info["stack"])
            if how == "docker":
                providers.ensure_image(info["image"])
                self.image = info["image"]
                self.cache = providers.cache_mount(lang, info.get("docker_cache"))
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
        self.data = Path(tempfile.mkdtemp(prefix="z2d-data-"))
        self.host = "0.0.0.0" if self.image else "127.0.0.1"
        self.app_env = dict({"PORT": str(self.port), "HOST": self.host,
                             "DATA_DIR": "/work/data" if self.image else str(self.data)}, **spec.get("env", {}))
        self.env = dict(os.environ, **self.app_env)

    def fill(self, cmd):
        return [part.replace("{port}", str(self.port)).replace("{host}", self.host) for part in cmd]

    def start(self):
        """Returns '' when the app is listening, otherwise a description of what went wrong."""
        seconds = self.spec.get("start_timeout", 40)
        if self.spec.get("compile"):
            problem = self.compile()
            if problem:
                return problem
        if "up" in self.spec:
            code, out, err = core.run(self.fill(self.spec["up"]), cwd=self.cwd, timeout=900, env=self.env)
            if code != 0:
                return clip((err + out).strip() or describe_exit(code), 25, 3000)
            alive = lambda: True
        else:
            self.log = tempfile.TemporaryFile(mode="w+")
            command = self.fill(self.spec["start"])
            if self.image:
                self.container = "z2d-app-" + uuid.uuid4().hex[:12]
                command = ["docker", "run", "--rm", "--init", "--name", self.container,
                           "--user", f"{os.getuid()}:{os.getgid()}", "-e", "HOME=/tmp",
                           "-p", f"127.0.0.1:{self.port}:{self.port}",
                           "-v", f"{self.cwd}:{providers.EX_MOUNT}", "-v", f"{self.data}:/work/data",
                           "-w", providers.EX_MOUNT]
                if self.cache:
                    command += ["-v", f"{self.cache[0]}:{self.cache[1]}"]
                for key, value in self.app_env.items():
                    command += ["-e", f"{key}={value}"]
                command += [self.image] + self.fill(self.spec["start"])
            try:
                self.proc = subprocess.Popen(command, cwd=self.cwd, env=self.env,
                                             stdin=subprocess.DEVNULL, stdout=self.log, stderr=subprocess.STDOUT,
                                             start_new_session=True)
            except FileNotFoundError:
                raise Skip(f"command not found: {self.spec['start'][0]}")
            alive = lambda: self.proc.poll() is None
        # A published container port accepts connections before the app inside listens,
        # so for a container "ready" means: it answers an HTTP request.
        ready = wait_for_http if self.container else wait_for_port
        if ready(self.port, seconds, alive):
            return ""
        return (f"nothing was listening on the port after {seconds} seconds. The app must listen on the port "
                f"given in the PORT environment variable.\n" + block("output:", self.output(), 20, 2500))

    def compile(self):
        """Compile the styles of a web exercise in the running copy. Returns '' or the compiler's message."""
        return compile_styles(self.spec, lambda cmd: core.run(cmd, cwd=self.cwd, timeout=120,
                                                              env=dict(self.env, NO_COLOR="1")))

    def output(self):
        if self.log is None:
            return ""
        self.log.flush()
        self.log.seek(0)
        return self.log.read()[-6000:]

    def stop(self):
        if self.container:
            core.run(["docker", "rm", "-f", self.container], timeout=60)
            self.container = None
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
        if self.data:
            shutil.rmtree(self.data, ignore_errors=True)
            self.data = None


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


# ---------------------------------------------------------------- web kind (HTML and CSS)

def load_page(spec, exdir):
    """The parsed page and every style rule that applies to it. Raises OSError if the page is missing."""
    page_name = spec.get("page", "index.html")
    page = webcheck.parse_html((exdir / page_name).read_text(encoding="utf-8"))
    sheets = []
    for el in page.all():
        if el.tag == "style":
            sheets.append("".join(c for c in el.children if isinstance(c, str)))
        elif el.tag == "link" and "stylesheet" in el.attrs.get("rel", "").lower():
            href = el.attrs.get("href", "")
            target = (exdir / page_name).parent / href
            if href and "://" not in href and target.is_file():
                sheets.append(target.read_text(encoding="utf-8"))
    rules = []
    for sheet in sheets:
        webcheck.parse_css(sheet, rules=rules)
    return page, rules


def source_check(exdir, chk):
    """A check on the text the learner wrote, for things that disappear when it is compiled."""
    name = chk["source"]
    try:
        text = (exdir / name).read_text(encoding="utf-8")
    except OSError:
        return f"{name} does not exist"
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)           # comments do not count
    text = re.sub(r"(?m)(^|\s)//[^\n]*", r"\1", text)
    for piece in [chk["contains"]] if isinstance(chk.get("contains"), str) else chk.get("contains", []):
        if piece not in text:
            return f"{name} should use: {piece}"
    for piece in [chk["not_contains"]] if isinstance(chk.get("not_contains"), str) else chk.get("not_contains", []):
        if piece in text:
            return f"{name} should not contain: {piece}"
    if "regex" in chk and re.search(chk["regex"], text, re.M | re.S) is None:
        return chk.get("fail", f"{name} does not have what this check looks for")
    if "count_of" in chk:
        found = len(re.findall(chk["count_of"], text))
        if found < chk.get("min_count", 0):
            return chk.get("fail", f"{name}: expected at least {chk['min_count']} of {chk['count_of']}, found {found}")
        if found > chk.get("max_count", found):
            return chk.get("fail", f"{name}: expected at most {chk['max_count']} of {chk['count_of']}, found {found}")
    return ""


def compile_styles(spec, run):
    """Compile the style sources an exercise names: {"style.scss": "style.css"}.

    `run(command)` runs a command in the folder that holds the files and returns
    (exit_code, stdout, stderr). Returns '' or the compiler's message.
    """
    for source, target in spec.get("compile", {}).items():
        code, out, err = run(["npx", "sass", "--no-source-map", "--quiet-deps", source, target])
        if code is None:
            return f"compiling {source} took too long"
        if code != 0:
            message = ANSI.sub("", (err or out).strip()) or describe_exit(code)
            return clip(message, 18, 1600)
    return ""


def web_check(page, rules, chk):
    """One check of a web exercise. Returns '' or what is wrong."""
    if chk.get("doctype"):
        return "" if page.doctype else "the page must start with <!doctype html>"
    if chk.get("valid"):
        return "\n".join(page.problems[:6])
    selector = chk["select"]
    try:
        found = webcheck.select(page, selector)
    except webcheck.SelectorError as exc:
        return str(exc)
    if "count" in chk and len(found) != chk["count"]:
        return f"expected {chk['count']} element(s) matching `{selector}`, found {len(found)}"
    if "min" in chk and len(found) < chk["min"]:
        return f"expected at least {chk['min']} element(s) matching `{selector}`, found {len(found)}"
    if "max" in chk and len(found) > chk["max"]:
        return f"expected at most {chk['max']} element(s) matching `{selector}`, found {len(found)}"
    if not found:
        return "" if chk.get("count") == 0 or "max" in chk else f"no element matches `{selector}`"
    if "text" in chk and found[0].text() != chk["text"]:
        return f"expected the text: {chk['text']}\ngot:               {found[0].text() or '(empty)'}"
    if "contains" in chk and not any(chk["contains"].lower() in el.text().lower() for el in found):
        return f"no `{selector}` contains the text: {chk['contains']}"
    for el in found:
        for name, want in chk.get("attr", {}).items():
            got = el.attrs.get(name)
            if want is True:
                if not got or not got.strip():
                    return f"{el.describe()} needs a non-empty {name} attribute"
            elif want is False:
                if got is not None:
                    return f"{el.describe()} must not have a {name} attribute"
            elif got is None or (got != want and not (str(want).startswith("~") and str(want)[1:] in got)):
                return f"{el.describe()} needs {name}=\"{str(want).lstrip('~')}\", got: {got!r}"
        for prop, want in chk.get("style", {}).items():
            got = webcheck.computed(el, prop, rules, chk.get("state"), chk.get("pseudo"), chk.get("media"))
            if not webcheck.value_ok(got, want):
                shown = want if isinstance(want, str) else " or ".join(
                    "(not set)" if w is None else str(w) for w in want)
                where = el.describe() + (f":{chk['state']}" if chk.get("state") else "")
                if chk.get("media"):
                    where += f" inside @media ({chk['media']})"
                return f"{where} should have {prop}: {shown.lstrip('~')}\ngot: {got if got is not None else '(not set)'}"
    return ""


def check_web(ex, exdir):
    spec = ex.spec
    results = []
    staged = None
    pagedir = exdir
    try:
        if spec.get("compile"):
            # Sass and the like: copy the exercise into its package set, compile there, check the result.
            with tempfile.TemporaryDirectory() as tmp:
                root, rel = workspaces.stage(spec["workspace"], ex, exdir)
                staged = (root, rel)
                env = toolchains.open_env("javascript", root, Path(tmp), writable=True)
                try:
                    problem = compile_styles(spec, lambda cmd: env.run(cmd, cwd=env.ex(rel), timeout=120,
                                                                       env={"NO_COLOR": "1", "CI": "1"}))
                finally:
                    env.close()
            label = " and ".join(spec["compile"]) + " compiles"
            results.append(Result(not problem, label, problem))
            if problem:
                return results
            pagedir = root / rel
        try:
            page, rules = load_page(spec, pagedir)
        except OSError:
            return results + [Result(False, f"{spec.get('page', 'index.html')} exists")]
        for chk in spec["checks"]:
            try:
                problem = source_check(exdir, chk) if "source" in chk else web_check(page, rules, chk)
            except webcheck.SelectorError as exc:
                problem = str(exc)
            results.append(Result(not problem, chk["name"], problem if problem else ""))
        return results
    finally:
        if staged:
            workspaces.unstage(*staged)


# ---------------------------------------------------------------- mongo kind

MONGO_MARK = "@@Z2D@@"


def json_equal(a, b):
    """Equal as data: key order does not matter, 2 equals 2.0."""
    if isinstance(a, bool) or isinstance(b, bool):
        return a is b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-6
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(json_equal(a[k], b[k]) for k in a)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(json_equal(x, y) for x, y in zip(a, b))
    return a == b


def docs_equal(got, want, ordered):
    if not isinstance(got, list) or len(got) != len(want):
        return False
    if ordered:
        return all(json_equal(g, w) for g, w in zip(got, want))
    left = list(got)
    for doc in want:
        match = next((i for i, g in enumerate(left) if json_equal(g, doc)), None)
        if match is None:
            return False
        left.pop(match)
    return True


def show_docs(value, limit=12):
    if not isinstance(value, list):
        return json.dumps(value)
    lines = [json.dumps(doc) for doc in value[:limit]]
    if len(value) > limit:
        lines.append(f"... ({len(value) - limit} more)")
    return "\n".join(lines) if lines else "(no documents)"


def run_mongo(spec, exdir, checks=()):
    """Run seed + the learner's script in a scratch database. Returns (error, result, check_values)."""
    prefix = services.mongo_client()
    name = "z2d_" + uuid.uuid4().hex[:12]
    parts = [f'db = db.getSiblingDB("{name}");']
    if spec.get("seed"):
        parts.append((exdir / spec["seed"]).read_text(encoding="utf-8"))
    offset = "\n;\n".join(parts).count("\n") + 2          # lines in front of the learner's code
    parts.append((exdir / spec.get("file", "query.js")).read_text(encoding="utf-8"))
    parts.append('let __r = (typeof result === "undefined") ? null : result;\n'
                 'if (__r && typeof __r.toArray === "function") { __r = __r.toArray(); }\n'
                 "const __checks = [];")
    for chk in checks:
        parts.append("try { __checks.push({v: (" + chk["eval"] + ")}); } "
                     "catch (e) { __checks.push({e: String(e.message || e)}); }")
    parts.append("for (const c of __checks) { if (c.v && typeof c.v.toArray === 'function') { c.v = c.v.toArray(); } }\n"
                 f'print("{MONGO_MARK}" + EJSON.stringify({{defined: typeof result !== "undefined", result: __r, '
                 "checks: __checks}, null, 0, {relaxed: true}));")
    try:
        code, out, err = core.run(prefix + ["--quiet", "--eval", "\n;\n".join(parts)], timeout=60)
    finally:
        core.run(prefix + ["--quiet", "--eval", f'db.getSiblingDB("{name}").dropDatabase()'], timeout=30)
    marker = out.rfind(MONGO_MARK)
    if code != 0 or marker < 0:
        message = (err + out).strip() or describe_exit(code)
        # the first line says what is wrong; line numbers refer to the learner's own file
        first = re.sub(r"z2d_[0-9a-f]{12}\.", "", message.split("\n")[0])
        first = re.sub(r"\((\d+):(\d+)\)", lambda m: f"(line {max(int(m.group(1)) - offset, 1)})", first)
        return first, None, []
    data = json.loads(out[marker + len(MONGO_MARK):].strip().split("\n")[0])
    return "", data, data["checks"]


def check_mongo(ex, exdir):
    spec = ex.spec
    fname = spec.get("file", "query.js")
    path = exdir / fname
    if not path.exists():
        return [Result(False, f"{fname} exists")]
    text = path.read_text(encoding="utf-8")
    if not re.sub(r"//[^\n]*|/\*.*?\*/|\s|;", "", text, flags=re.S):
        return [Result(False, f"{fname} contains code", f"{fname} is empty. Write your MongoDB commands in it.")]
    error, data, values = run_mongo(spec, exdir, spec.get("checks", []))
    if error:
        return [Result(False, f"{fname} runs without errors", error)]
    results = [Result(True, f"{fname} runs without errors")]
    plain = re.sub(r"//[^\n]*", "", text)
    for word in spec.get("require", []):
        found = word in plain
        results.append(Result(found, f"uses {word}", "" if found else f"{fname} must use {word} for this exercise"))
    expect = spec.get("expect")
    if expect is not None:
        if not data["defined"]:
            results.append(Result(False, "result is defined", f"{fname} must put its answer in a variable: const result = ..."))
        elif "docs" in expect:
            ordered = expect.get("ordered", False)
            ok = docs_equal(data["result"], expect["docs"], ordered)
            label = "result documents match" + (" (order matters)" if ordered else "")
            detail = "" if ok else (block("expected:", show_docs(expect["docs"])) + "\n"
                                    + block("got:     ", show_docs(data["result"])))
            results.append(Result(ok, label, detail))
        else:
            ok = json_equal(data["result"], expect["value"])
            results.append(Result(ok, "result has the right value", "" if ok else
                                  f"expected: {json.dumps(expect['value'])}\ngot:      {json.dumps(data['result'])}"))
    for chk, value in zip(spec.get("checks", []), values):
        if "e" in value:
            results.append(Result(bool(chk.get("error")), chk["name"], "" if chk.get("error") else value["e"]))
            continue
        if chk.get("error"):
            results.append(Result(False, chk["name"], "this command should be rejected, but it succeeded"))
            continue
        got, want = value.get("v"), chk.get("expect")
        if isinstance(want, list) and not chk.get("ordered", True):
            ok = docs_equal(got, want, False)
        else:
            ok = json_equal(got, want)
        results.append(Result(ok, chk["name"], "" if ok else chk.get("fail") or
                              (block("expected:", show_docs(want)) + "\n" + block("got:     ", show_docs(got)))))
    return results


def show_mongo(ex, exdir=None):
    """Run a MongoDB exercise on its sample data. Returns (error, result)."""
    error, data, _ = run_mongo(ex.spec, exdir or ex.dir)
    if error:
        return error, None
    return "", data["result"] if data["defined"] else None


# ---------------------------------------------------------------- redis kind

REDIS_DB = "15"                      # the exercises use database 15 and empty it before and after
_redis_lock = threading.Lock()


def redis_lines(text):
    return [line.strip() for line in text.split("\n") if line.strip() and not line.strip().startswith("#")]


def redis_script(prefix, text):
    """Send commands to redis-cli, one per line. Returns the output, replies in order."""
    code, out, err = core.run(prefix + ["-n", REDIS_DB], stdin="\n".join(redis_lines(text)) + "\n", timeout=30)
    return (out + err).rstrip("\n")


def run_redis(spec, exdir, checks=()):
    """Run seed + the learner's commands in the scratch database. Returns (output, [reply lines per check])."""
    prefix = services.redis_client()
    with _redis_lock:
        core.run(prefix + ["-n", REDIS_DB, "FLUSHDB"], timeout=20)
        try:
            if spec.get("seed"):
                redis_script(prefix, (exdir / spec["seed"]).read_text(encoding="utf-8"))
            output = redis_script(prefix, (exdir / spec.get("file", "commands.redis")).read_text(encoding="utf-8"))
            replies = []
            for chk in checks:
                _, out, err = core.run(prefix + ["-n", REDIS_DB] + shlex.split(chk["cmd"]), timeout=20)
                replies.append([line for line in (out + err).rstrip("\n").split("\n") if line != ""])
        finally:
            core.run(prefix + ["-n", REDIS_DB, "FLUSHDB"], timeout=20)
    return output, replies


def check_redis(ex, exdir):
    spec = ex.spec
    fname = spec.get("file", "commands.redis")
    path = exdir / fname
    if not path.exists():
        return [Result(False, f"{fname} exists")]
    text = path.read_text(encoding="utf-8")
    lines = redis_lines(text)
    if not lines:
        return [Result(False, f"{fname} contains commands", f"{fname} is empty. Write one Redis command per line.")]
    output, replies = run_redis(spec, exdir, spec.get("checks", []))
    errors = [line for line in output.split("\n") if re.match(r"^(\(error\) )?(ERR|WRONGTYPE|NOAUTH|EXECABORT)\b", line)]
    results = [Result(not errors, "the commands run without errors", "\n".join(errors[:5]))]
    used = {line.split()[0].upper() for line in lines}
    for word in spec.get("require", []):
        found = word.upper() in used
        results.append(Result(found, f"uses {word.upper()}", "" if found else f"{fname} must use {word.upper()}"))
    for chk, got in zip(spec.get("checks", []), replies):
        problem = ""
        if "expect" in chk:
            want = chk["expect"] if isinstance(chk["expect"], list) else [str(chk["expect"])]
            want = [str(w) for w in want]
            same = sorted(got) == sorted(want) if chk.get("unordered") else got == want
            if not same:
                problem = (block("expected:", "\n".join(want) or "(nothing)") + "\n"
                           + block("got:     ", "\n".join(got) or "(nothing)"))
        if not problem and ("min" in chk or "max" in chk):
            try:
                number = float(got[0])
            except (IndexError, ValueError):
                number = None
            if number is None or number < chk.get("min", number) or number > chk.get("max", number):
                problem = (f"expected a number between {chk.get('min', '-inf')} and {chk.get('max', 'inf')}, "
                           f"got: {' '.join(got) or '(nothing)'}")
        if problem:
            problem = f"checked with: {chk['cmd']}\n" + problem
        results.append(Result(not problem, chk["name"], problem))
    return results


def show_redis(ex, exdir=None):
    output, _ = run_redis(ex.spec, exdir or ex.dir)
    return output


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
    if ex.kind == "web":
        return check_web(ex, exdir)
    if ex.kind == "mongo":
        return check_mongo(ex, exdir)
    if ex.kind == "redis":
        return check_redis(ex, exdir)
    raise Skip(f"unknown exercise kind: {ex.kind}")
