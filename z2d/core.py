"""Shared pieces: paths, the Exercise model, running a process, formatting output."""
import json
import os
import signal
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EX_ROOT = ROOT / "exercises"
CATALOG = ROOT / "catalog"
GUIDE = ROOT / "guide"
WORK_ROOT = Path(os.environ.get("Z2D_WORK", Path.home() / "zero2dev-work"))
DEFAULT_TIMEOUT = 10


class Skip(Exception):
    """The exercise cannot be checked on this machine right now (something is missing)."""


class NeedsDownload(Skip):
    """Something must be downloaded first: a Docker image or a package workspace.

    The terminal downloads on the spot. The web app shows a Download button instead,
    so that a request never hangs for minutes.
    """

    def __init__(self, kind, name, message):
        super().__init__(message)
        self.kind = kind
        self.name = name


class Result:
    def __init__(self, ok, name, detail=""):
        self.ok = ok
        self.name = name
        self.detail = detail

    def as_dict(self):
        return {"ok": self.ok, "name": self.name, "detail": self.detail}


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


def find_exercise(ex_id):
    path = EX_ROOT / ex_id
    # ex_id comes from the command line or the web app: accept only track/name inside exercises/.
    if len(Path(ex_id).parts) != 2 or ".." in Path(ex_id).parts or not (path / "exercise.json").is_file():
        return None
    return Exercise(path)


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


def clip(text, max_lines=12, max_chars=1200):
    """Shorten long output so one failure does not flood the screen."""
    text = text.rstrip("\n")
    lines = text.split("\n")
    if len(lines) > max_lines:
        lines = lines[:max_lines] + [f"... ({len(lines) - max_lines} more lines)"]
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[:max_chars] + " ..."
    return text


def block(label, text, max_lines=12, max_chars=1200):
    """Format a labelled, indented block for a failure report."""
    text = clip(text, max_lines, max_chars)
    if text == "":
        text = "(nothing)"
    lines = text.split("\n")
    pad = " " * (len(label) + 1)
    return "\n".join([f"{label} {lines[0]}"] + [pad + line for line in lines[1:]])


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
