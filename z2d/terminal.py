"""A real terminal on this machine, driven from the app's pages.

The page shows the output and sends what the learner types. Behind it is an ordinary
interactive bash on a pseudo-terminal, started in the project folder, with the learner's own
environment. So an install can ask for a password or a choice, and the learner answers in
the browser, on the same page where they read the lesson.

The page is a simple display, not a full terminal emulator: the shell is told the terminal
is "dumb", so programs print plain lines. Programs that paint the whole screen (vim, top)
need a real terminal.
"""
import codecs
import fcntl
import os
import pty
import signal
import struct
import termios
import threading
import time
import uuid

from . import core

MAX_SESSIONS = 4
KEEP = 300_000              # characters of output kept per session
IDLE_SECONDS = 2 * 60 * 60  # a session nobody looked at for this long is closed

_sessions = {}
_lock = threading.Lock()

RC = """\
# zero2dev: start-up file of the terminal shown in the browser
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"
[ -d "$HOME/.local/share/mise/shims" ] && PATH="$HOME/.local/share/mise/shims:$PATH"
[ -d "$HOME/.local/bin" ] && PATH="$HOME/.local/bin:$PATH"
[ -d "$HOME/.cargo/bin" ] && PATH="$HOME/.cargo/bin:$PATH"
export PATH
unset PROMPT_COMMAND
PS1='\\w \\$ '
"""


class Session:
    def __init__(self, cwd):
        self.id = uuid.uuid4().hex[:12]
        self.text = ""          # the output still kept
        self.start = 0          # how many characters were dropped before self.text
        self.alive = True
        self.seen = time.time()
        self.cond = threading.Condition()
        rc = core.WORK_ROOT / ".app" / "terminal.rc"
        rc.parent.mkdir(parents=True, exist_ok=True)
        rc.write_text(RC, encoding="utf-8")
        env = dict(os.environ, TERM="dumb", PAGER="cat", GIT_PAGER="cat", NO_COLOR="1",
                   COLUMNS="120", LINES="40", Z2D_TERMINAL="1")
        self.pid, self.fd = pty.fork()
        if self.pid == 0:       # the child: becomes the shell
            try:
                os.chdir(cwd)
                os.execvpe("bash", ["bash", "--noediting", "--rcfile", str(rc), "-i"], env)
            finally:
                os._exit(127)
        try:
            fcntl.ioctl(self.fd, termios.TIOCSWINSZ, struct.pack("HHHH", 40, 120, 0, 0))
        except OSError:
            pass
        threading.Thread(target=self._pump, daemon=True).start()

    def _pump(self):
        decoder = codecs.getincrementaldecoder("utf-8")(errors="replace")
        while True:
            try:
                data = os.read(self.fd, 4096)
            except OSError:
                data = b""
            if not data:
                break
            text = decoder.decode(data)
            with self.cond:
                self.text += text
                if len(self.text) > KEEP:
                    drop = len(self.text) - KEEP
                    self.text = self.text[drop:]
                    self.start += drop
                self.cond.notify_all()
        with self.cond:
            self.alive = False
            self.cond.notify_all()
        try:
            os.waitpid(self.pid, 0)
        except OSError:
            pass

    def read(self, since, wait):
        """Output from position `since` on. Waits up to `wait` seconds for something new."""
        self.seen = time.time()
        deadline = time.time() + wait
        with self.cond:
            while self.alive and self.start + len(self.text) <= since:
                left = deadline - time.time()
                if left <= 0:
                    break
                self.cond.wait(left)
            begin = max(since - self.start, 0)
            return {"data": self.text[begin:], "next": self.start + len(self.text), "alive": self.alive}

    def write(self, data):
        self.seen = time.time()
        try:
            os.write(self.fd, data.encode("utf-8"))
        except OSError:
            pass

    def close(self):
        for sig in (signal.SIGHUP, signal.SIGKILL):
            try:
                os.killpg(os.getpgid(self.pid), sig)
            except (OSError, ProcessLookupError):
                break
            time.sleep(0.05)
        try:
            os.close(self.fd)
        except OSError:
            pass


def _tidy():
    now = time.time()
    for key in [k for k, s in _sessions.items() if not s.alive or now - s.seen > IDLE_SECONDS]:
        _sessions.pop(key).close()


def open_session(cwd=None):
    with _lock:
        _tidy()
        if len(_sessions) >= MAX_SESSIONS:
            oldest = min(_sessions.values(), key=lambda s: s.seen)
            _sessions.pop(oldest.id).close()
        session = Session(str(cwd or core.ROOT))
        _sessions[session.id] = session
        return session


def get(session_id):
    with _lock:
        return _sessions.get(session_id)


def close_session(session_id):
    with _lock:
        session = _sessions.pop(session_id, None)
    if session:
        session.close()


def close_all():
    with _lock:
        sessions = list(_sessions.values())
        _sessions.clear()
    for session in sessions:
        session.close()


def count():
    with _lock:
        return sum(1 for s in _sessions.values() if s.alive)
