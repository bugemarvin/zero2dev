"""Websites that may use this app from another address, such as the guide hosted on Vercel.

The lessons can be read on a public site while the exercises run here, on the learner's
own machine. For that, a page from that site must be allowed to call this server. That is
a real grant of power: such a page can run code on this computer, exactly as the app's own
pages can. So nothing is allowed by default. The learner approves each site once, on a page
served by this app itself, and can remove it again on the Setup page or with:

    python3 app.py trust https://example.vercel.app
    python3 app.py untrust https://example.vercel.app
    python3 app.py trusted
"""
import json
import re
import threading

from . import core

FILE = core.WORK_ROOT / ".app" / "origins.json"
_lock = threading.Lock()

# https://host[:port], or plain http only for this computer itself (development)
VALID = re.compile(r"^(https://[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?(:\d{1,5})?"
                   r"|http://(localhost|127\.0\.0\.1)(:\d{1,5})?)$")


def clean(origin):
    """The origin in its normal form, or None when it is not one we would ever accept."""
    if not isinstance(origin, str):
        return None
    origin = origin.strip().rstrip("/").lower()
    return origin if VALID.match(origin) else None


def trusted():
    try:
        data = json.loads(FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    return [o for o in data if clean(o) == o] if isinstance(data, list) else []


def is_trusted(origin):
    return origin is not None and clean(origin) in trusted()


def add(origin):
    origin = clean(origin)
    if origin is None:
        return None
    with _lock:
        current = trusted()
        if origin not in current:
            FILE.parent.mkdir(parents=True, exist_ok=True)
            FILE.write_text(json.dumps(sorted(current + [origin]), indent=1), encoding="utf-8")
    return origin


def remove(origin):
    origin = clean(origin)
    with _lock:
        current = trusted()
        if origin in current:
            FILE.write_text(json.dumps([o for o in current if o != origin], indent=1), encoding="utf-8")
            return True
    return False
