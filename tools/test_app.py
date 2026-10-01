#!/usr/bin/env python3
"""Tests for the local web app: the security rules of the server, and the API end to end.

    python3 tools/test_app.py

Starts the server on a spare port, with progress and working folders redirected
to a temporary directory, so nothing of the learner's is touched.
"""
import http.client
import json
import os
import sys
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TMP = tempfile.mkdtemp(prefix="z2d-test-")
os.environ["Z2D_WORK"] = str(Path(TMP) / "work")
os.environ.update(GIT_AUTHOR_NAME="learner", GIT_AUTHOR_EMAIL="learner@zero2dev.invalid",
                  GIT_COMMITTER_NAME="learner", GIT_COMMITTER_EMAIL="learner@zero2dev.invalid")
sys.path.insert(0, str(ROOT))

from z2d import origins, progress, server  # noqa: E402

origins.FILE = Path(TMP) / "origins.json"

progress.PROGRESS_FILE = Path(TMP) / "progress.json"
progress.PROGRESS_JS = Path(TMP) / "nowhere" / "progress.js"
progress.PROFILE_FILE = Path(TMP) / "profile.json"
progress.GAME_FILE = Path(TMP) / "game.json"

srv, TOKEN, PORT = server.create(port=4790)
threading.Thread(target=srv.serve_forever, daemon=True).start()
HOST = f"127.0.0.1:{PORT}"

failures = []
count = 0


def request(method, path, body=None, token=TOKEN, headers=None, host=HOST, content_type="application/json"):
    conn = http.client.HTTPConnection("127.0.0.1", PORT, timeout=120)
    all_headers = {"Host": host}
    if token:
        all_headers["X-Z2D-Token"] = token
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        all_headers["Content-Type"] = content_type
    all_headers.update(headers or {})
    conn.request(method, path, body=data, headers=all_headers)
    resp = conn.getresponse()
    raw = resp.read()
    conn.close()
    try:
        return resp.status, json.loads(raw), resp
    except ValueError:
        return resp.status, raw, resp


def check(name, condition, detail=""):
    global count
    count += 1
    if not condition:
        failures.append(name)
        print(f"FAIL {name} {detail}")


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


# ---------------------------------------------------------------- security
status, body, resp = request("GET", "/", token=None)
check("the home page is served", status == 200 and b"zero2dev" in body)
check("no CORS header is sent", resp.getheader("Access-Control-Allow-Origin") is None)
check("nosniff is set", resp.getheader("X-Content-Type-Options") == "nosniff")

status, body, _ = request("GET", "/api/session", token=None)
check("the session endpoint gives the token to a same-origin page", status == 200 and body.get("token") == TOKEN)

status, _, _ = request("GET", "/api/state", token=None)
check("the API refuses a request without the token", status == 401)
status, _, _ = request("GET", "/api/state", token="wrong")
check("the API refuses a wrong token", status == 401)
status, _, _ = request("GET", "/api/state")
check("the API accepts the right token", status == 200)

status, _, _ = request("GET", "/api/session", token=None, host="evil.example")
check("a foreign Host header is refused (DNS rebinding)", status == 403)
status, _, _ = request("GET", "/api/state", host=f"evil.example:{PORT}")
check("a foreign Host header is refused even with the token", status == 403)
status, _, _ = request("POST", "/api/run", {"id": "python/01-first-functions"}, headers={"Origin": "http://evil.example"})
check("a foreign Origin is refused", status == 403)
status, _, _ = request("GET", "/api/session", token=None, headers={"Sec-Fetch-Site": "cross-site"})
check("a cross-site fetch of the token is refused", status == 403)
status, _, _ = request("POST", "/api/run", {"id": "python/01-first-functions"}, content_type="text/plain")
check("a non-JSON POST is refused", status == 415)
status, _, _ = request("GET", "/../check.py", token=None)
check("files outside the guide are not served", status == 404)
status, _, _ = request("GET", "/%2e%2e/check.py", token=None)
check("encoded path traversal is not served", status == 404)
status, _, _ = request("GET", "/api/exercise?id=../../etc")
check("an exercise id cannot escape the exercises folder", status == 404)
status, _, _ = request("POST", "/api/save", {"id": "python/01-first-functions", "files": {"exercise.json": "{}"}})
check("a file the exercise does not declare cannot be written", status == 403)
status, _, _ = request("POST", "/api/save", {"id": "c/06-functions", "files": {"test_main.c": "x"}})
check("a test driver cannot be overwritten", status == 403)
status, _, _ = request("POST", "/api/save", {"id": "python/01-first-functions", "files": {"../../evil.py": "x"}})
check("a path outside the exercise cannot be written", status == 403)

# ---------------------------------------------------------------- a Python exercise, end to end
EX = "python/01-first-functions"
starter = read(f"exercises/{EX}/solution.py")
solution = read(f"solutions/{EX}/solution.py")
try:
    status, body, _ = request("GET", f"/api/exercise?id={EX}")
    names = [f["name"] for f in body["files"]]
    check("the exercise lists its editable file", status == 200 and body["files"][0]["editable"] and names[0] == "solution.py")
    check("the editor content is the file on disk", body["files"][0]["content"] == starter)

    status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"solution.py": starter}})
    check("the starter fails", status == 200 and body["status"] == "failed" and any(not r["ok"] for r in body["results"]))
    status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"solution.py": starter}})
    check("a hint appears after the second failure", bool(body.get("hint")))

    status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"solution.py": solution}})
    check("the solution passes", body["status"] == "passed" and all(r["ok"] for r in body["results"]), str(body)[:300])
    check("the file on disk is what was sent", read(f"exercises/{EX}/solution.py") == solution)
    check("progress records the pass", EX in body["progress"]["passed"])

    status, body, _ = request("POST", "/api/reset", {"id": EX})
    check("reset restores the starter", read(f"exercises/{EX}/solution.py") == starter and body["restored"] == ["solution.py"])
finally:
    (ROOT / f"exercises/{EX}/solution.py").write_text(starter, encoding="utf-8")

# ---------------------------------------------------------------- C with a test driver
EX = "c/06-functions"
starter = read(f"exercises/{EX}/mathx.c")
try:
    status, body, _ = request("GET", f"/api/exercise?id={EX}")
    editable = [f["name"] for f in body["files"] if f["editable"]]
    readonly = [f["name"] for f in body["files"] if not f["editable"]]
    check("C: only the learner's file is editable", editable == ["mathx.c"], str(editable))
    check("C: the header and the test driver are shown read-only", "mathx.h" in readonly and "test_main.c" in readonly)
    check("C: the toolchain status is reported", body["toolchain"]["state"] in ("native", "docker", "docker-download", "missing"))
    status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"mathx.c": read(f"solutions/{EX}/mathx.c")}})
    check("C: the solution passes through the API", body["status"] in ("passed", "skipped"), str(body)[:300])
finally:
    (ROOT / f"exercises/{EX}/mathx.c").write_text(starter, encoding="utf-8")

# ---------------------------------------------------------------- any-language exercise
EX = "dsa/01-max-of-list"
status, body, _ = request("GET", f"/api/exercise?id={EX}")
check("any-language exercise offers the languages", body["any_lang"] and any(l["id"] == "java" for l in body["langs"]))
check("any-language exercise defaults to Python", body["lang"] == "python")
created = ROOT / f"exercises/{EX}/solution.rb"
try:
    status, body, _ = request("POST", "/api/lang", {"id": EX, "lang": "ruby"})
    check("switching language creates a starter", status == 200 and body["lang"] == "ruby" and created.exists())
    check("the editable file follows the language", body["files"][0]["name"] == "solution.rb")
finally:
    created.unlink(missing_ok=True)

# ---------------------------------------------------------------- SQL
EX = "sql/01-select-where"
starter = read(f"exercises/{EX}/query.sql")
try:
    status, body, _ = request("POST", "/api/show", {"id": EX, "files": {"query.sql": "SELECT title FROM books WHERE price < 10 ORDER BY title;"}})
    check("SQL show returns the result table", body.get("columns") == ["title"] and body["rows"] == [["Paper Boats"], ["Small Hours"]], str(body))
    status, body, _ = request("POST", "/api/show", {"id": EX, "files": {"query.sql": "SELEC nonsense;"}})
    check("SQL show reports a syntax error", "error" in body)
    status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"query.sql": read(f"solutions/{EX}/query.sql")}})
    check("SQL: the solution passes", body["status"] == "passed")
finally:
    (ROOT / f"exercises/{EX}/query.sql").write_text(starter, encoding="utf-8")

# ---------------------------------------------------------------- git exercise through the command line
EX = "git/01-first-commit"
status, body, _ = request("GET", f"/api/exercise?id={EX}")
check("git: no editor files, a working folder instead", body["sandbox"] is not None and not any(f["editable"] for f in body["files"]))
status, body, _ = request("POST", "/api/run", {"id": EX})
check("git: the empty working folder fails", body["status"] == "failed")
for command in ["git init -q .", "echo '# hi' > README.md", "git add README.md && git commit -qm 'Add README'"]:
    status, body, _ = request("POST", "/api/shell", {"id": EX, "command": command})
    check(f"git: `{command}` runs", status == 200 and body["code"] == 0, str(body))
status, body, _ = request("POST", "/api/shell", {"id": EX, "command": "git log --oneline"})
check("git: command output comes back", "Add README" in body["stdout"])
status, body, _ = request("POST", "/api/run", {"id": EX})
check("git: the exercise passes after the commands", body["status"] == "passed", str(body)[:300])
request("POST", "/api/shell", {"id": EX, "command": "mkdir sub && cd sub"})
status, body, _ = request("POST", "/api/shell", {"id": EX, "command": "pwd"})
check("the command line remembers the current folder", body["cwd"] == "sub" and body["stdout"].strip().endswith("/sub"), str(body))
status, body, _ = request("POST", "/api/shell", {"id": EX, "command": "exit 3"})
check("a failing command reports its exit code", body["code"] == 3)
status, body, _ = request("POST", "/api/sandbox", {"id": EX, "action": "reset"})
status, body, _ = request("POST", "/api/run", {"id": EX})
check("git: resetting the working folder starts over", body["status"] == "failed")
status, _, _ = request("POST", "/api/shell", {"id": "python/01-first-functions", "command": "ls"})
check("the command line is refused for other kinds of exercise", status == 400)

# ---------------------------------------------------------------- an app exercise (http kind)
import shutil  # noqa: E402
import urllib.request  # noqa: E402

if shutil.which("node"):
    EX = "js/07-http-server"
    starter = read(f"exercises/{EX}/server.mjs")
    solution = read(f"solutions/{EX}/server.mjs")
    try:
        status, body, _ = request("GET", f"/api/exercise?id={EX}")
        check("http exercise offers Start app", body["can_start_app"] is True and body["app"] is None)
        status, body, _ = request("POST", "/api/run", {"id": EX, "files": {"server.mjs": solution}})
        check("http exercise: the checker starts the server and the solution passes", body["status"] == "passed", str(body)[:400])
        status, body, _ = request("POST", "/api/app", {"id": EX, "action": "start", "files": {"server.mjs": solution}})
        check("Start app returns a local address", bool(body.get("app")) and body["app"]["url"].startswith("http://127.0.0.1:"), str(body)[:300])
        if body.get("app"):
            with urllib.request.urlopen(body["app"]["url"] + "health", timeout=10) as resp:
                check("the started app answers", resp.status == 200 and b"ok" in resp.read())
            status, info, _ = request("GET", f"/api/exercise?id={EX}")
            check("the exercise reports the running app", info["app"] is not None)
        status, body, _ = request("POST", "/api/app", {"id": EX, "action": "stop"})
        check("Stop app stops it", body["app"] is None)
    finally:
        request("POST", "/api/app", {"id": EX, "action": "stop"})
        (ROOT / f"exercises/{EX}/server.mjs").write_text(starter, encoding="utf-8")

# ---------------------------------------------------------------- nested files and package sets
EX = "next/01-pages"
status, body, _ = request("GET", f"/api/exercise?id={EX}")
editable = [f["name"] for f in body["files"] if f["editable"]]
check("files in sub-folders are editable by their path", editable == ["app/page.jsx", "app/about/page.jsx"], str(editable))
status, _, _ = request("POST", "/api/save", {"id": EX, "files": {"app/layout.jsx": "x"}})
check("a given file in a sub-folder cannot be overwritten", status == 403)
status, body, _ = request("POST", "/api/run", {"id": "react/03-counter"})
check("a missing package set is offered as a download, not installed silently",
      body["status"] == "skipped" and body.get("download") == {"kind": "workspace", "name": "react"}, str(body)[:300])
status, body, _ = request("POST", "/api/job", {"kind": "workspace", "name": "nonsense"})
check("only catalog package sets can be downloaded", status == 404)

# ---------------------------------------------------------------- environment
status, body, _ = request("GET", "/api/doctor")
check("doctor lists toolchains, services and tracks", status == 200 and body["toolchains"] and body["services"] and body["tracks"])
python_item = next(t for t in body["toolchains"] if t["id"] == "python")
check("an installed tool is reported as already installed", python_item["state"] == "native" and "already installed" in python_item["detail"])
status, body, _ = request("POST", "/api/profile", {"tracks": ["c", "nonsense", "sql"]})
check("the profile keeps only known tracks", body["profile"]["tracks"] == ["c", "sql"])
status, body, _ = request("GET", "/api/state")
check("state returns the profile and the exercises", body["profile"]["tracks"] == ["c", "sql"] and len(body["exercises"]) > 50)
status, body, _ = request("POST", "/api/job", {"kind": "image", "name": "evil/image"})
check("only catalog images can be downloaded", status == 404)
status, body, _ = request("POST", "/api/job", {"kind": "install", "name": "rm -rf"})
check("only known stacks can be installed", status == 404)

status, body, _ = request("POST", "/api/job", {"kind": "install", "name": "python", "fallback": True})
check("a stack with one way of installing has no fallback", status in (400, 409), str(status))
status, body, _ = request("GET", "/api/state")
check("state says which system the app runs on", body.get("platform", {}).get("os") in ("linux", "wsl", "macos"), str(body.get("platform")))
status, body, _ = request("GET", "/api/track?id=go")
check("a track reports what it needs", status == 200 and [n["id"] for n in body["needs"]] == ["go"] and "ready" in body, str(body)[:200])
status, body, _ = request("GET", "/api/track?id=nonsense")
check("an unknown track is refused", status == 404)
status, body, _ = request("GET", "/api/autostart")
check("autostart reports whether it is available and on", status == 200 and isinstance(body.get("supported"), bool)
      and isinstance(body.get("enabled"), bool), str(body)[:200])

# ---------------------------------------------------------------- quizzes, game state
status, body, _ = request("GET", "/assets/quizzes.js", token=None)
check("the quizzes are served", status == 200 and b"Z2D_QUIZZES" in body)
status, body, _ = request("GET", "/paths.html", token=None)
check("the paths page is served", status == 200 and b"paths-page" in body)
status, body, _ = request("GET", "/api/game")
check("the game state starts empty", status == 200 and body == {"game": {}}, str(body))
game = {"quiz": {"start/00-welcome": {"best": 4, "total": 5}}, "days": ["2026-01-01"], "path": "zero"}
status, body, _ = request("POST", "/api/game", {"game": game})
check("the game state can be saved", status == 200 and body == {"saved": True})
status, body, _ = request("GET", "/api/game")
check("and read back", body == {"game": game}, str(body))
status, body, _ = request("POST", "/api/game", {"game": "not an object"})
check("a game state that is not an object is refused", status == 400)
status, body, _ = request("POST", "/api/game", {"game": {"junk": "x" * 500_000}})
check("an oversized game state is refused", status == 400)

# ---------------------------------------------------------------- HTML and CSS exercises
WEB = "html/01-first-page"
status, body, _ = request("GET", f"/api/exercise?id={WEB}")
check("a web exercise offers its page for editing and a preview",
      body["kind"] == "web" and [f["name"] for f in body["files"] if f["editable"]] == ["index.html"] and body["can_start_app"],
      str(body)[:200])
starter_page = read(f"exercises/{WEB}/index.html")
try:
    status, body, _ = request("POST", "/api/run", {"id": WEB})
    check("the starter page fails its checks", body["status"] == "failed")
    status, body, _ = request("POST", "/api/run", {"id": WEB, "files": {"index.html": read(f"solutions/{WEB}/index.html")}})
    check("a correct page passes", body["status"] == "passed", str(body.get("results"))[:300])
    status, body, _ = request("POST", "/api/app", {"id": WEB, "action": "start"})
    url = (body.get("app") or {}).get("url", "")
    check("the preview of a page starts on its own port", status == 200 and url.startswith("http://127.0.0.1:"), str(body)[:200])
    if url:
        import urllib.request
        page = urllib.request.urlopen(url + "index.html", timeout=10).read()
        check("the preview serves the learner's page", b"About me" in page)
    status, body, _ = request("POST", "/api/app", {"id": WEB, "action": "stop"})
    check("the preview stops", body == {"app": None})
finally:
    (ROOT / "exercises" / WEB / "index.html").write_text(starter_page, encoding="utf-8")

CSS = "css/01-selectors"
starter_css = read(f"exercises/{CSS}/style.css")
try:
    status, body, _ = request("POST", "/api/save", {"id": CSS, "files": {"index.html": "<p>changed</p>"}})
    check("the given page of a CSS exercise cannot be overwritten", status == 403)
    status, body, _ = request("POST", "/api/run", {"id": CSS, "files": {"style.css": "h1 { color: navy; }"}})
    names = {r["name"]: r["ok"] for r in body["results"]}
    check("CSS is judged rule by rule", body["status"] == "failed" and names.get("the h1 is navy") is True
          and names.get("the active link is bold") is False, str(names)[:300])
finally:
    (ROOT / "exercises" / CSS / "style.css").write_text(starter_css, encoding="utf-8")

# ---------------------------------------------------------------- the guide hosted on another address
SITE = "https://zero2dev.example.app"
status, body, resp = request("GET", "/api/hello", token=None, headers={"Origin": SITE})
check("any website may ask whether the app is here, and learns nothing else",
      status == 200 and body == {"app": "zero2dev", "paired": False, "connect": f"http://127.0.0.1:{PORT}/connect.html"}
      and resp.getheader("Access-Control-Allow-Origin") == "*", str(body))
status, _, _ = request("GET", "/api/hello", token=None, headers={"Origin": SITE}, host="evil.example")
check("hello still refuses a wrong Host", status == 403)
status, _, resp = request("OPTIONS", "/api/run", token=None, headers={"Origin": SITE, "Access-Control-Request-Method": "POST"})
check("a website that was not approved fails the browser's pre-check", status == 403 and resp.getheader("Access-Control-Allow-Origin") is None)
status, _, _ = request("GET", "/api/session", token=None, headers={"Origin": SITE})
check("a website that was not approved cannot get the token", status == 403)
status, body, _ = request("POST", "/api/pair", {"origin": "http://evil.example"})
check("only https sites can be approved", status == 400, str(body))
status, body, _ = request("POST", "/api/pair", {"origin": SITE + "/"})
check("the learner's own page can approve a website", status == 200 and body["origins"] == [SITE], str(body))
status, body, resp = request("GET", "/api/hello", token=None, headers={"Origin": SITE})
check("hello now says the site is approved", body.get("paired") is True)
status, body, resp = request("GET", "/api/session", token=None, headers={"Origin": SITE})
check("an approved website gets the token, with a CORS header naming it only",
      status == 200 and body.get("token") == TOKEN and resp.getheader("Access-Control-Allow-Origin") == SITE)
status, _, resp = request("OPTIONS", "/api/run", token=None, headers={"Origin": SITE, "Access-Control-Request-Method": "POST"})
check("an approved website passes the pre-check, including the private-network one",
      status == 204 and resp.getheader("Access-Control-Allow-Origin") == SITE
      and resp.getheader("Access-Control-Allow-Private-Network") == "true"
      and "X-Z2D-Token" in (resp.getheader("Access-Control-Allow-Headers") or ""))
status, body, resp = request("GET", "/api/state", headers={"Origin": SITE})
check("an approved website can use the API", status == 200 and "exercises" in body and resp.getheader("Access-Control-Allow-Origin") == SITE)
status, _, _ = request("GET", "/api/state", token=None, headers={"Origin": SITE})
check("an approved website still needs the token", status == 401)
status, _, _ = request("GET", "/api/state", headers={"Origin": SITE}, host="evil.example")
check("an approved website still fails with a wrong Host", status == 403)
status, _, _ = request("GET", "/index.html", token=None, headers={"Origin": SITE})
check("an approved website gets the API and no pages", status == 403)
status, _, _ = request("POST", "/api/pair", {"origin": "https://another.example"}, headers={"Origin": SITE})
check("an approved website cannot approve other websites", status == 403)
status, _, _ = request("POST", "/api/unpair", {"origin": SITE}, headers={"Origin": SITE})
check("nor remove one", status == 403)
status, _, _ = request("GET", "/api/session", token=None, headers={"Origin": "https://other.example"})
check("another website is still refused", status == 403)
status, body, _ = request("POST", "/api/unpair", {"origin": SITE})
check("the learner can remove a website", status == 200 and body["origins"] == [])
status, _, _ = request("GET", "/api/session", token=None, headers={"Origin": SITE})
check("and it is refused again at once", status == 403)
status, body, _ = request("GET", "/connect.html", token=None)
check("the approval page is served by the app itself", status == 200 and b"Allow a website" in body)

srv.shutdown()
print(f"{count} checks, {len(failures)} failed")
sys.exit(1 if failures else 0)
