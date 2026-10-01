"""What the learner has passed, how often they tried, and which tracks they chose."""
import datetime
import json

from . import core

PROGRESS_FILE = core.ROOT / ".progress.json"
PROGRESS_JS = core.GUIDE / "progress.js"
PROFILE_FILE = core.ROOT / ".profile.json"


def now():
    return datetime.datetime.now().replace(microsecond=0).isoformat()


def load_progress():
    try:
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    if PROGRESS_JS.parent.is_dir():
        # A plain script file, so the guide can show progress even when opened from file://
        PROGRESS_JS.write_text("window.Z2D_PROGRESS = " + json.dumps(public(progress), sort_keys=True) + ";\n",
                               encoding="utf-8")


def public(progress):
    passed = {k: v["passed_at"] for k, v in progress.items() if v.get("passed")}
    return {"passed": passed, "updated": now()}


def record(progress, ex_id, passed):
    """Count one attempt. Returns the entry for that exercise."""
    entry = progress.setdefault(ex_id, {"attempts": 0})
    entry["attempts"] = entry.get("attempts", 0) + 1
    if passed:
        if not entry.get("passed"):
            entry["passed"] = True
            entry["passed_at"] = now()
    else:
        entry["fails"] = entry.get("fails", 0) + 1
    return entry


def next_hint(ex, entry):
    """The hint to show after a failure, or None. Hints start at the second failure."""
    hints = ex.spec.get("hints", [])
    fails = entry.get("fails", 0)
    if not hints or fails < 2:
        return None
    return hints[min(fails - 2, len(hints) - 1)]


def load_profile():
    try:
        return json.loads(PROFILE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {"tracks": []}


def save_profile(profile):
    PROFILE_FILE.write_text(json.dumps(profile, indent=1, sort_keys=True) + "\n", encoding="utf-8")


GAME_FILE = core.ROOT / ".game.json"


def load_game():
    """Quiz results, streak days, the chosen path and the place the learner stopped at."""
    try:
        data = json.loads(GAME_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save_game(game):
    GAME_FILE.write_text(json.dumps(game, indent=1, sort_keys=True) + "\n", encoding="utf-8")
