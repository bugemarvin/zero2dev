"""Keep the app running in the background, and start it when you log in.

    python3 app.py start        run in the background, on a fixed port
    python3 app.py stop
    python3 app.py status
    python3 app.py autostart on | off | status

How "start at login" is done depends on the system:

    Linux with systemd      a user service: ~/.config/systemd/user/zero2dev.service
    other Linux desktops    an autostart entry: ~/.config/autostart/zero2dev.desktop
    macOS                   a launch agent: ~/Library/LaunchAgents/dev.zero2dev.app.plist
    Ubuntu in WSL           a script in the Windows Startup folder that runs the app inside WSL

Nothing here needs administrator rights, and `autostart off` removes what `on` created.

Start at login is switched on by the first ordinary `python3 app.py`, with a notice, so that a
learner finds the app at the same address every day. The choice is remembered: after
`autostart off` it is never switched on again by itself. `--no-autostart`, or the environment
variable Z2D_AUTOSTART=0, starts the app without touching this.
"""
import json
import os
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

from . import core, platforminfo

DEFAULT_PORT = 4750
STATE_DIR = core.WORK_ROOT / ".app"
STATE_FILE = STATE_DIR / "app.json"
LOG_FILE = STATE_DIR / "app.log"
CHOICE_FILE = STATE_DIR / "autostart.json"
APP = core.ROOT / "app.py"

SYSTEMD_UNIT = Path.home() / ".config" / "systemd" / "user" / "zero2dev.service"
XDG_ENTRY = Path.home() / ".config" / "autostart" / "zero2dev.desktop"
LAUNCH_AGENT = Path.home() / "Library" / "LaunchAgents" / "dev.zero2dev.app.plist"
WINDOWS_SCRIPT = "zero2dev.vbs"


def url(port):
    return f"http://127.0.0.1:{port}/"


def answers(port, timeout=1.5):
    """Is a zero2dev server answering on this port?"""
    try:
        with urllib.request.urlopen(url(port) + "api/session", timeout=timeout) as reply:
            return "token" in json.loads(reply.read().decode("utf-8", "replace"))
    except (OSError, ValueError, urllib.error.URLError):
        return False


def read_state():
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def write_state(port):
    """Called by the server itself, so that `status` and `stop` can find it however it was started."""
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps({"pid": os.getpid(), "port": port, "started": int(time.time())}), encoding="utf-8")


def clear_state():
    if read_state().get("pid") == os.getpid():
        try:
            STATE_FILE.unlink()
        except OSError:
            pass


def alive(pid):
    try:
        os.kill(pid, 0)
    except (OSError, TypeError):
        return False
    return True


def status():
    """{'running': bool, 'port': int, 'pid': int or None, 'url': str}"""
    state = read_state()
    port = state.get("port", DEFAULT_PORT)
    running = alive(state.get("pid")) and answers(port)
    if not running and answers(DEFAULT_PORT):
        running, port = True, DEFAULT_PORT
    return {"running": running, "port": port, "pid": state.get("pid") if running else None, "url": url(port)}


# ---------------------------------------------------------------- start and stop

def _wsl_keeper(port):
    """Under WSL a background process dies when the last Ubuntu window closes, because Windows
    shuts the whole Linux system down. A hidden wsl.exe on the Windows side that runs the server
    keeps it up. Returns True when that was launched (which does not yet mean it works)."""
    powershell = platforminfo._windows_tool("powershell.exe")
    if not powershell:
        return False
    arguments = _wsl_arguments(port).replace("'", "''")
    command = f"Start-Process -FilePath wsl.exe -ArgumentList '{arguments}' -WindowStyle Hidden"
    return platforminfo._spawn([powershell, "-NoProfile", "-NonInteractive", "-Command", command],
                               "/mnt/c" if os.path.isdir("/mnt/c") else None)


def _launch(port):
    with open(LOG_FILE, "ab") as log:
        subprocess.Popen([sys.executable, str(APP), "--no-browser", "--exact-port", "--port", str(port)],
                         cwd=str(core.ROOT), stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                         start_new_session=True)


def _wait(port, seconds):
    deadline = time.time() + seconds
    while time.time() < deadline:
        if answers(port, 0.5):
            return True
        time.sleep(0.25)
    return False


def start(port=DEFAULT_PORT, open_browser=True, quiet=False):
    """Start the server in the background. Returns an exit code."""
    say = (lambda *a: None) if quiet else print
    now = status()
    if now["running"]:
        say(f"zero2dev is already running at {now['url']}")
        if open_browser:
            platforminfo.open_url(now["url"])
        return 0
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    wsl = platforminfo.detect()["os"] == "wsl"
    kept = wsl and _wsl_keeper(port) and _wait(port, 12)
    if not kept:
        # The ordinary way. Under WSL it is also the way back when the Windows side did not
        # manage to start it: the app must come up whatever Windows makes of the request.
        _launch(port)
        if not _wait(port, 15):
            say(f"The app did not start. Port {port} may be in use by another program: try --port 4760. Log: {LOG_FILE}")
            return 1
    say(f"zero2dev is running in the background at {url(port)}")
    say("Stop it with: python3 app.py stop")
    if wsl and not kept:
        say("Note: Windows stops Ubuntu when its last Ubuntu window closes, and the app with it. "
            "Keep an Ubuntu window open, or start the app again when you need it.")
    if open_browser:
        platforminfo.open_url(url(port))
    return 0


def stop(quiet=False):
    say = (lambda *a: None) if quiet else print
    state = read_state()
    pid = state.get("pid")
    if not alive(pid):
        say("zero2dev is not running in the background.")
        return 0
    os.kill(pid, signal.SIGTERM)
    for _ in range(40):
        if not alive(pid):
            break
        time.sleep(0.25)
    else:
        os.kill(pid, signal.SIGKILL)
    try:
        STATE_FILE.unlink()
    except OSError:
        pass
    say("zero2dev was stopped.")
    return 0


# ---------------------------------------------------------------- start at login

def choice():
    """What was decided about starting at login: 'on', 'off', 'unavailable', or None if nothing yet."""
    try:
        return json.loads(CHOICE_FILE.read_text(encoding="utf-8")).get("choice")
    except (OSError, ValueError):
        return None


def record_choice(value):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    CHOICE_FILE.write_text(json.dumps({"choice": value, "at": int(time.time())}), encoding="utf-8")


def first_run_enable(port):
    """Switch start-at-login on, once, the first time the app is started in the ordinary way.

    Returns a message when the app is now running in the background, otherwise None
    (already decided, not available here, or it did not work: the caller then runs it as before).
    Whatever goes wrong in here must never stop the app from starting.
    """
    if choice() is not None or os.environ.get("Z2D_AUTOSTART", "1") == "0" or port != DEFAULT_PORT:
        return None
    try:
        how = method()
        if how is None:
            record_choice("unavailable")
            return None
        print("First start: setting zero2dev up to start when you log in ...", flush=True)
        ok, _message = autostart_on(port)
        if ok and _wait(port, 12):
            record_choice("on")
            return ("zero2dev now starts by itself when you log in, and stays at " + url(port) + "\n"
                    "It uses " + DESCRIPTION[how] + ". No administrator rights were needed.\n"
                    "To switch that off: python3 app.py autostart off     To stop it now: python3 app.py stop")
    except Exception as error:      # noqa: BLE001 - a convenience must not break the app
        print(f"(Could not set up start at login: {error}. Carrying on without it.)", flush=True)
    try:
        autostart_off()
    except Exception:               # noqa: BLE001
        pass
    record_choice("unavailable")
    return None


def _systemd_user():
    if shutil.which("systemctl") is None:
        return False
    try:
        probe = subprocess.run(["systemctl", "--user", "show-environment"], capture_output=True, timeout=10)
    except (OSError, subprocess.SubprocessError):
        return False
    return probe.returncode == 0


def _windows_startup_folder():
    """The Startup folder of the Windows user, as a WSL path, or None."""
    powershell = platforminfo._windows_tool("powershell.exe")
    if not powershell or shutil.which("wslpath") is None:
        return None
    try:
        out = subprocess.run([powershell, "-NoProfile", "-NonInteractive", "-Command", "[Environment]::GetFolderPath('Startup')"],
                             capture_output=True, text=True, errors="replace", timeout=30,
                             stdin=subprocess.DEVNULL, cwd="/mnt/c" if os.path.isdir("/mnt/c") else None)
        folder = out.stdout.strip().splitlines()[-1].strip() if out.stdout.strip() else ""
        if not folder:
            return None
        unix = subprocess.run(["wslpath", "-u", folder], capture_output=True, text=True, errors="replace",
                              timeout=10).stdout.strip()
    except (OSError, ValueError, subprocess.SubprocessError, IndexError):
        return None
    return Path(unix) if unix and os.path.isdir(unix) else None


def _wsl_arguments(port):
    """What wsl.exe is given, on the Windows side, to run the server inside this Linux."""
    distro = platforminfo.detect().get("wsl_distro") or "Ubuntu"
    return (f'-d {distro} --cd "{core.ROOT}" --exec {os.path.basename(sys.executable)} app.py '
            f'--no-browser --exact-port --port {port}')


def _windows_script_text(port):
    command = "wsl.exe " + _wsl_arguments(port)
    quoted = command.replace('"', '""')
    return ("' zero2dev: runs the learning app inside WSL, with no window.\r\n"
            "' Created by: python3 app.py autostart on.  Removed by: python3 app.py autostart off\r\n"
            f'CreateObject("WScript.Shell").Run "{quoted}", 0, False\r\n')


_method = []


def method():
    """Which mechanism this system offers: systemd, xdg, launchd, windows-startup or None.

    Worked out once: under WSL the answer costs a call into Windows, which is slow.
    """
    if not _method:
        _method.append(_find_method())
    return _method[0]


def _find_method():
    kind = platforminfo.detect()["os"]
    if kind == "macos":
        return "launchd"
    if kind == "wsl":
        return "windows-startup" if _windows_startup_folder() else ("systemd" if _systemd_user() else None)
    if kind == "linux":
        if _systemd_user():
            return "systemd"
        # a desktop autostart entry only means something when there is a desktop session
        desktop = any(os.environ.get(name) for name in ("XDG_CURRENT_DESKTOP", "DISPLAY", "WAYLAND_DISPLAY"))
        return "xdg" if desktop else None
    return None


DESCRIPTION = {
    "systemd": "a systemd user service (zero2dev.service)",
    "xdg": "a desktop autostart entry (~/.config/autostart/zero2dev.desktop)",
    "launchd": "a launch agent (~/Library/LaunchAgents/dev.zero2dev.app.plist)",
    "windows-startup": "a script in the Windows Startup folder, which runs the app inside WSL when you log in to Windows",
}


def autostart_status():
    how = method()
    enabled = False
    if how == "systemd":
        enabled = SYSTEMD_UNIT.exists()
    elif how == "xdg":
        enabled = XDG_ENTRY.exists()
    elif how == "launchd":
        enabled = LAUNCH_AGENT.exists()
    elif how == "windows-startup":
        folder = _windows_startup_folder()
        enabled = bool(folder and (folder / WINDOWS_SCRIPT).exists())
    return {"supported": how is not None, "enabled": enabled, "method": how,
            "description": DESCRIPTION.get(how, "not available on this system"), "port": DEFAULT_PORT}


def autostart_on(port=DEFAULT_PORT):
    """Returns (ok, message)."""
    how = method()
    python = sys.executable
    if how == "systemd":
        SYSTEMD_UNIT.parent.mkdir(parents=True, exist_ok=True)
        SYSTEMD_UNIT.write_text(
            "[Unit]\nDescription=zero2dev learning app\n\n"
            "[Service]\n"
            f"WorkingDirectory={core.ROOT}\n"
            f"ExecStart={python} {APP} --no-browser --exact-port --port {port}\n"
            "Restart=on-failure\nRestartSec=5\n"
            f"Environment=PATH={os.environ.get('PATH', '/usr/bin:/bin')}\n\n"
            "[Install]\nWantedBy=default.target\n", encoding="utf-8")
        stop(quiet=True)
        subprocess.run(["systemctl", "--user", "daemon-reload"], capture_output=True, timeout=30)
        done = subprocess.run(["systemctl", "--user", "enable", "--now", "zero2dev.service"],
                              capture_output=True, text=True, timeout=60)
        if done.returncode != 0:
            return False, "systemctl could not enable the service: " + (done.stderr or done.stdout).strip()
        return True, f"The app now starts when you log in, and is running at {url(port)}"
    if how == "xdg":
        XDG_ENTRY.parent.mkdir(parents=True, exist_ok=True)
        XDG_ENTRY.write_text(
            "[Desktop Entry]\nType=Application\nName=zero2dev\nComment=The zero2dev learning app\n"
            f"Exec={python} {APP} start --no-browser --port {port}\nX-GNOME-Autostart-enabled=true\nNoDisplay=true\n",
            encoding="utf-8")
        start(port, open_browser=False, quiet=True)
        return True, f"The app now starts when you log in to your desktop, and is running at {url(port)}"
    if how == "launchd":
        LAUNCH_AGENT.parent.mkdir(parents=True, exist_ok=True)
        LAUNCH_AGENT.write_text(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n'
            '<plist version="1.0"><dict>\n'
            "  <key>Label</key><string>dev.zero2dev.app</string>\n"
            "  <key>ProgramArguments</key><array>\n"
            f"    <string>{python}</string><string>{APP}</string><string>--no-browser</string>"
            f"<string>--exact-port</string><string>--port</string><string>{port}</string>\n"
            "  </array>\n"
            f"  <key>WorkingDirectory</key><string>{core.ROOT}</string>\n"
            "  <key>RunAtLoad</key><true/>\n  <key>KeepAlive</key><true/>\n"
            f"  <key>StandardOutPath</key><string>{LOG_FILE}</string>\n"
            f"  <key>StandardErrorPath</key><string>{LOG_FILE}</string>\n"
            "</dict></plist>\n", encoding="utf-8")
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        stop(quiet=True)
        subprocess.run(["launchctl", "unload", str(LAUNCH_AGENT)], capture_output=True, timeout=30)
        done = subprocess.run(["launchctl", "load", "-w", str(LAUNCH_AGENT)], capture_output=True, text=True, timeout=30)
        if done.returncode != 0:
            return False, "launchctl could not load the agent: " + (done.stderr or done.stdout).strip()
        return True, f"The app now starts when you log in, and is running at {url(port)}"
    if how == "windows-startup":
        folder = _windows_startup_folder()
        if folder is None:
            return False, "The Windows Startup folder could not be found from inside Ubuntu."
        (folder / WINDOWS_SCRIPT).write_text(_windows_script_text(port), encoding="utf-8")
        if start(port, open_browser=False, quiet=True) != 0:
            return False, "The entry was added to the Windows Startup folder, but the app did not start now."
        return True, (f"The app now starts when you log in to Windows, and is running at {url(port)}\n"
                      f"It was added to the Windows Startup folder as {WINDOWS_SCRIPT}.")
    return False, "Starting at login is not available on this system. `python3 app.py start` runs it in the background."


def autostart_off():
    how = method()
    if how == "systemd":
        subprocess.run(["systemctl", "--user", "disable", "--now", "zero2dev.service"], capture_output=True, timeout=60)
        if SYSTEMD_UNIT.exists():
            SYSTEMD_UNIT.unlink()
        subprocess.run(["systemctl", "--user", "daemon-reload"], capture_output=True, timeout=30)
    elif how == "xdg":
        if XDG_ENTRY.exists():
            XDG_ENTRY.unlink()
    elif how == "launchd":
        subprocess.run(["launchctl", "unload", "-w", str(LAUNCH_AGENT)], capture_output=True, timeout=30)
        if LAUNCH_AGENT.exists():
            LAUNCH_AGENT.unlink()
    elif how == "windows-startup":
        folder = _windows_startup_folder()
        if folder and (folder / WINDOWS_SCRIPT).exists():
            (folder / WINDOWS_SCRIPT).unlink()
    else:
        return False, "Nothing to switch off: starting at login is not available on this system."
    return True, "The app no longer starts at login. If it is running now, stop it with: python3 app.py stop"


def command(argv):
    """The `autostart` sub-command of app.py."""
    action = argv[0] if argv else "status"
    if action == "on":
        ok, message = autostart_on()
        if ok:
            record_choice("on")
    elif action == "off":
        ok, message = autostart_off()
        record_choice("off")            # remembered: it is never switched on again by itself
    elif action == "status":
        info = autostart_status()
        if not info["supported"]:
            print("Starting at login is not available on this system.")
        else:
            print(("on" if info["enabled"] else "off") + ": " + info["description"])
        now = status()
        print(f"The app is {'running at ' + now['url'] if now['running'] else 'not running'}.")
        return 0
    else:
        print("Usage: python3 app.py autostart on | off | status")
        return 2
    print(message)
    return 0 if ok else 1
