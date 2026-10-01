"""Where the app is running: Ubuntu inside WSL on Windows, plain Linux, or macOS.

The pages use this to show the instructions for this system first, and the
server uses it to open the browser that the learner actually has: under WSL
that is the Windows browser, not a Linux one.
"""
import os
import platform
import shutil
import subprocess
import webbrowser

_cache = None


def _os_release():
    info = {}
    try:
        with open("/etc/os-release", encoding="utf-8") as handle:
            for line in handle:
                key, sep, value = line.strip().partition("=")
                if sep:
                    info[key] = value.strip('"')
    except OSError:
        pass
    return info


def detect():
    """A small description of this machine. Cached: it does not change while the app runs."""
    global _cache
    if _cache is not None:
        return _cache
    system = platform.system()
    info = {"os": "other", "name": system or "this system", "distro": "", "version": "", "family": "other",
            "pkg": None, "wsl_distro": None, "installer": False}
    if system == "Darwin":
        info.update(os="macos", name=f"macOS {platform.mac_ver()[0]}".strip(), family="mac",
                    pkg="brew" if shutil.which("brew") else None)
    elif system == "Windows":
        info.update(os="windows", name=f"Windows {platform.release()}", family="windows")
    elif system == "Linux":
        release = _os_release()
        wsl = "microsoft" in platform.release().lower() or bool(os.environ.get("WSL_DISTRO_NAME"))
        like = (release.get("ID", "") + " " + release.get("ID_LIKE", "")).lower()
        family = ("debian" if "debian" in like or "ubuntu" in like else
                  "fedora" if "fedora" in like or "rhel" in like else
                  "arch" if "arch" in like else
                  "alpine" if "alpine" in like else "other")
        pkg = next((tool for tool in ("apt-get", "dnf", "pacman", "zypper", "apk") if shutil.which(tool)), None)
        pretty = release.get("PRETTY_NAME") or "Linux"
        info.update(os="wsl" if wsl else "linux", name=pretty + (" in WSL on Windows" if wsl else ""),
                    distro=release.get("ID", ""), version=release.get("VERSION_ID", ""), family=family,
                    pkg="apt" if pkg == "apt-get" else pkg, wsl_distro=os.environ.get("WSL_DISTRO_NAME"),
                    installer=pkg == "apt-get")
    _cache = info
    return info


def _spawn(cmd, cwd=None):
    try:
        subprocess.Popen(cmd, cwd=cwd, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL, start_new_session=True)
        return True
    except OSError:
        return False


def _windows_tool(name):
    """A Windows program reachable from WSL, even when the Windows PATH is not passed through."""
    found = shutil.which(name)
    if found:
        return found
    for folder in ("/mnt/c/Windows/System32", "/mnt/c/Windows", "/mnt/c/Windows/System32/WindowsPowerShell/v1.0"):
        candidate = os.path.join(folder, name)
        if os.path.isfile(candidate):
            return candidate
    return None


def open_url(url):
    """Open a page in the learner's browser. Returns True when something was started."""
    if detect()["os"] == "wsl":
        # A drive of Windows as the working folder avoids cmd.exe's complaint about UNC paths.
        cwd = "/mnt/c" if os.path.isdir("/mnt/c") else None
        if shutil.which("wslview") and _spawn(["wslview", url]):
            return True
        cmd = _windows_tool("cmd.exe")
        if cmd and _spawn([cmd, "/c", "start", "", url], cwd):
            return True
        explorer = _windows_tool("explorer.exe")
        if explorer and _spawn([explorer, url], cwd):
            return True
        return False
    try:
        return bool(webbrowser.open(url))
    except webbrowser.Error:
        return False


def windows_path(path):
    """The path as Windows sees it (\\\\wsl.localhost\\Ubuntu\\home\\...), or None outside WSL."""
    if detect()["os"] != "wsl" or shutil.which("wslpath") is None:
        return None
    try:
        out = subprocess.run(["wslpath", "-w", str(path)], capture_output=True, text=True, errors="replace", timeout=10)
    except (OSError, ValueError, subprocess.SubprocessError):
        return None
    return out.stdout.strip() or None


def open_folder(path):
    """Show a folder in the file manager of the system the learner is sitting at."""
    kind = detect()["os"]
    if kind == "wsl":
        explorer, target = _windows_tool("explorer.exe"), windows_path(path)
        return bool(explorer and target and _spawn([explorer, target], "/mnt/c" if os.path.isdir("/mnt/c") else None))
    if kind == "macos":
        return _spawn(["open", str(path)])
    opener = shutil.which("xdg-open")
    return bool(opener and _spawn([opener, str(path)]))
