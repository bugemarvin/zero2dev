"""The local web server: serves the guide and the JSON API on 127.0.0.1 only.

This server runs the learner's code, so it is locked down:
  - it listens on the loopback interface and nowhere else;
  - the Host header must name this server (blocks DNS rebinding);
  - a request that says it comes from another site is refused (Origin / Sec-Fetch-Site);
  - every API call other than /api/session needs the session token, which only a
    page served from this origin can read;
  - no CORS headers are sent, except to a website the learner has approved on this
    computer (see origins.py), which may then use the API from its own address. The Host
    check still applies to it, and it needs the session token like any other page.
"""
import hmac
import json
import mimetypes
import secrets
import signal
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import api, background, core, origins, platforminfo, providers, workspaces

MAX_BODY = 2_000_000


def make_handler(token, port):
    hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
    own_origins = {f"http://{h}" for h in hosts}

    class Handler(BaseHTTPRequestHandler):
        server_version = "zero2dev"
        protocol_version = "HTTP/1.1"

        def log_message(self, *args):       # keep the terminal quiet
            pass

        # ---- responses
        cors = None         # the approved website this request comes from, or "*" for /api/hello

        def cors_headers(self):
            if self.cors is None:
                return
            self.send_header("Access-Control-Allow-Origin", self.cors)
            self.send_header("Vary", "Origin")

        def send(self, status, body, content_type):
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Cross-Origin-Resource-Policy", "cross-origin" if self.cors else "same-origin")
            self.send_header("Referrer-Policy", "no-referrer")
            # never inside a frame of another site: a hidden frame could trick a click on "Allow"
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Content-Security-Policy", "frame-ancestors 'none'")
            self.cors_headers()
            try:
                self.end_headers()
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass                        # the page was closed or reloaded before the answer arrived

        def json(self, status, data):
            self.send(status, json.dumps(data).encode(), "application/json; charset=utf-8")

        def refuse(self, status, message):
            self.json(status, {"error": message})

        # ---- checks
        def trusted(self, page=False):
            """May this request be answered? `page`: it asks for a page of the guide, not for the API.

            A page may be opened by following a link from anywhere, for example from the copy of the
            guide that is online: the other site cannot read what comes back, and the pages are the
            public guide anyway. The API is different: it runs code, so it answers only this app's own
            pages and websites the learner approved.
            """
            self.cors = None
            if self.headers.get("Host") not in hosts:
                self.refuse(403, "this server only answers on 127.0.0.1")
                return False
            origin = self.headers.get("Origin")
            if origin is not None and origin not in own_origins:
                if not origins.is_trusted(origin):
                    self.refuse(403, "requests from other sites are not accepted")
                    return False
                self.cors = origin          # a website the learner approved on this computer
                return True
            if page and self.command == "GET":
                return True
            if self.headers.get("Sec-Fetch-Site", "same-origin") not in ("same-origin", "none"):
                self.refuse(403, "requests from other sites are not accepted")
                return False
            return True

        def hello(self):
            """The one thing any website may ask: is the app here, and am I approved?

            It reveals nothing else, and it is how a hosted copy of the guide finds the app.
            """
            origin = self.headers.get("Origin")
            self.cors = "*"
            self.json(200, {"app": "zero2dev", "paired": origins.is_trusted(origin),
                            "connect": f"http://127.0.0.1:{port}/connect.html"})

        def do_OPTIONS(self):
            """The browser's question before a request from another site: is this allowed?"""
            origin = self.headers.get("Origin")
            path = urllib.parse.urlsplit(self.path).path
            allowed = self.headers.get("Host") in hosts and (path == "/api/hello" or origins.is_trusted(origin))
            self.send_response(204 if allowed else 403)
            if allowed:
                self.send_header("Access-Control-Allow-Origin", "*" if path == "/api/hello" else origin)
                self.send_header("Access-Control-Allow-Methods", "GET, POST")
                self.send_header("Access-Control-Allow-Headers", "X-Z2D-Token, Content-Type")
                self.send_header("Access-Control-Allow-Private-Network", "true")
                self.send_header("Access-Control-Max-Age", "600")
                self.send_header("Vary", "Origin")
            self.send_header("Content-Length", "0")
            self.end_headers()

        def has_token(self):
            given = self.headers.get("X-Z2D-Token", "")
            if hmac.compare_digest(given, token):
                return True
            self.refuse(401, "missing or wrong session token")
            return False

        def call(self, handler, data):
            try:
                self.json(200, handler(data))
            except api.ApiError as exc:
                self.refuse(exc.status, str(exc))
            except core.Skip as skip:
                self.refuse(409, str(skip))
            except Exception as exc:        # report it to the page; never take the server down
                self.refuse(500, f"{type(exc).__name__}: {exc}")

        # ---- methods
        def do_GET(self):
            url = urllib.parse.urlsplit(self.path)
            if url.path == "/api/hello" and self.headers.get("Host") in hosts:
                self.hello()
                return
            if not self.trusted(page=not url.path.startswith("/api/")):
                return
            if url.path == "/api/session":
                self.json(200, {"token": token})
                return
            if url.path.startswith("/api/"):
                handler = api.GET.get(url.path[5:])
                if handler is None:
                    self.refuse(404, "no such endpoint")
                elif self.has_token():
                    self.call(handler, dict(urllib.parse.parse_qsl(url.query)))
                return
            if self.cors:
                self.refuse(403, "pages are served to this computer only")       # an approved site gets the API, nothing else
                return
            self.static(url.path)

        def do_POST(self):
            if not self.trusted():
                return
            url = urllib.parse.urlsplit(self.path)
            if self.cors and url.path in ("/api/pair", "/api/unpair"):
                self.refuse(403, "only this computer can approve or remove a website")
                return
            handler = api.POST.get(url.path[5:]) if url.path.startswith("/api/") else None
            if handler is None:
                self.refuse(404, "no such endpoint")
                return
            if not self.has_token():
                return
            if not self.headers.get("Content-Type", "").startswith("application/json"):
                self.refuse(415, "send JSON")
                return
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY:
                self.refuse(413, "request too large")
                return
            try:
                data = json.loads(self.rfile.read(length) or b"{}")
            except ValueError:
                self.refuse(400, "invalid JSON")
                return
            if not isinstance(data, dict):
                self.refuse(400, "send a JSON object")
                return
            self.call(handler, data)

        def static(self, path):
            if path.endswith("/"):
                path += "index.html"
            target = (core.GUIDE / urllib.parse.unquote(path).lstrip("/")).resolve()
            if core.GUIDE.resolve() not in target.parents or not target.is_file():
                self.send(404, b"not found", "text/plain; charset=utf-8")
                return
            kind = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
            if kind.startswith("text/") or kind in ("application/javascript", "application/json"):
                kind += "; charset=utf-8"
            self.send(200, target.read_bytes(), kind)

    return Handler


def create(port=4750, tries=20):
    """Bind to the first free port from `port` upwards. Returns (server, token, port)."""
    # A request must never hang for minutes on a download: the page offers a button instead.
    providers.AUTO_PULL = False
    workspaces.AUTO_INSTALL = False
    token = secrets.token_urlsafe(32)
    last_error = None
    for candidate in range(port, port + tries):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", candidate), make_handler(token, candidate))
        except OSError as exc:
            last_error = exc
            continue
        server.daemon_threads = True
        return server, token, candidate
    raise SystemExit(f"could not open a port near {port}: {last_error}")


def serve(port=4750, open_browser=True, exact=False):
    """Run until stopped. With `exact`, use this port or fail: a background app must be where it was promised."""
    server, _token, port = create(port, tries=1 if exact else 20)
    url = f"http://127.0.0.1:{port}/"
    background.write_state(port)

    def on_term(_signum, _frame):       # `app.py stop`, systemd, a logout: finish cleanly
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, on_term)
    print(f"zero2dev is running at {url}")
    print("It uses the tools on this machine. Only this computer can reach it. Press Ctrl+C to stop.")
    where = platforminfo.detect()
    if where["os"] == "wsl":
        print(f"You are on {where['name']}: use your Windows browser. The address above works there.")
    if open_browser and not platforminfo.open_url(url):
        print(f"Could not open a browser. Open this address yourself: {url}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopping ...")
    finally:
        api.stop_all_apps()
        server.server_close()
        background.clear_state()
    return 0


if __name__ == "__main__":
    sys.exit(serve())
