"""A tiny page-hit counter. Given: do not edit.

GET /health  -> {"status": "ok"}
GET /hits    -> {"hits": N}, where N grows by one with every request and is kept in Redis.

The address of Redis comes from the environment variable REDIS_HOST.
"""
import json
import os
import signal
import socket
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")


def redis_incr(key):
    """Send INCR to Redis using its plain-text protocol, retrying while Redis is starting."""
    last_error = None
    for _ in range(20):
        try:
            with socket.create_connection((REDIS_HOST, 6379), timeout=2) as conn:
                conn.sendall(f"*2\r\n$4\r\nINCR\r\n${len(key)}\r\n{key}\r\n".encode())
                reply = conn.recv(64).decode()
            return int(reply[1:].strip())
        except (OSError, ValueError) as error:
            last_error = error
            time.sleep(0.5)
    raise RuntimeError(f"cannot reach Redis at {REDIS_HOST}: {last_error}")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(fmt % args, flush=True)

    def send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {"status": "ok"})
        elif self.path == "/hits":
            try:
                self.send_json(200, {"hits": redis_incr("hits")})
            except RuntimeError as error:
                self.send_json(503, {"error": str(error)})
        else:
            self.send_json(404, {"error": "not found"})


signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
print(f"listening on 8000, Redis at {REDIS_HOST}", flush=True)
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
