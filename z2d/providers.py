"""Where a toolchain runs: natively if it is installed, otherwise in a Docker container.

An environment object hides the difference. It knows how to name the exercise
folder and the build folder for the tools, and how to run a command there.
"""
import os
import shutil
import sys
import threading
import time
import uuid

from . import core

EX_MOUNT = "/work/ex"
OUT_MOUNT = "/work/out"

# CLI use downloads a missing image on the spot. The web app sets this to False
# and offers a Download button instead, so a request never hangs for minutes.
AUTO_PULL = True

_docker_cache = {"at": 0.0, "state": None}
_lock = threading.Lock()


def mode():
    """auto (native first, Docker as fallback), native, or docker."""
    value = os.environ.get("Z2D_PROVIDER", "auto").lower()
    return value if value in ("auto", "native", "docker") else "auto"


def docker_state(fresh=False):
    """'ok', 'missing' (not installed), 'stopped' (daemon not running) or 'denied' (no permission)."""
    with _lock:
        if not fresh and _docker_cache["state"] and time.time() - _docker_cache["at"] < 15:
            return _docker_cache["state"]
        if shutil.which("docker") is None:
            state = "missing"
        else:
            code, _, err = core.run(["docker", "info", "--format", "{{.ServerVersion}}"], timeout=15)
            if code == 0:
                state = "ok"
            elif "permission denied" in err.lower():
                state = "denied"
            else:
                state = "stopped"
        _docker_cache.update(at=time.time(), state=state)
        return state


DOCKER_HELP = {
    "missing": "Docker is not installed (setup/install.sh --stack docker; on Windows install Docker Desktop).",
    "stopped": "Docker is installed but not running. Start Docker Desktop, or: sudo service docker start",
    "denied": "Docker is installed but your user may not use it. Run: sudo usermod -aG docker $USER  then log out and in.",
}


def image_present(image):
    code, _, _ = core.run(["docker", "image", "inspect", image], timeout=20)
    return code == 0


def pull_image(image):
    code, out, err = core.run(["docker", "pull", image], timeout=3600)
    return code == 0, (err or out).strip()


def ensure_image(image):
    if image_present(image):
        return
    if not AUTO_PULL:
        raise Skip_needs_download(image)
    sys.stderr.write(f"  downloading the Docker image {image} (one time) ...\n")
    ok, message = pull_image(image)
    if not ok:
        raise core.Skip(f"could not download the Docker image {image}: {message.splitlines()[-1] if message else 'unknown error'}")


class NeedsDownload(core.Skip):
    """A Docker image must be downloaded first. Carries the image name for the web app."""

    def __init__(self, image):
        super().__init__(f"the Docker image {image} is not downloaded yet. "
                         f"Download it with: docker pull {image}")
        self.image = image


def Skip_needs_download(image):
    return NeedsDownload(image)


def native_ok(needs):
    return all(shutil.which(tool) for tool in needs)


def choose(name, needs, image, stack):
    """Decide how to provide a toolchain. Returns 'native' or 'docker', or raises Skip."""
    wanted = mode()
    have_native = native_ok(needs)
    if wanted in ("auto", "native") and have_native:
        return "native"
    if wanted == "native":
        raise core.Skip(f"{name} needs {', '.join(needs)}. Install with: setup/install.sh --stack {stack}")
    if image:
        state = docker_state()
        if state == "ok":
            return "docker"
        if wanted == "docker":
            raise core.Skip(f"{name} was asked to run in Docker. {DOCKER_HELP[state]}")
        missing = ", ".join(t for t in needs if not shutil.which(t))
        raise core.Skip(f"{name} needs {missing}. Install with: setup/install.sh --stack {stack}\n"
                        f"      Or use Docker to run it without installing. {DOCKER_HELP[state]}")
    if have_native:
        return "native"
    raise core.Skip(f"{name} needs {', '.join(needs)}. Install with: setup/install.sh --stack {stack}")


class NativeEnv:
    kind = "native"

    def __init__(self, exdir, outdir):
        self.exdir = exdir
        self.outdir = outdir
        self.python = sys.executable

    def ex(self, name=""):
        return str(self.exdir / name) if name else str(self.exdir)

    def out(self, name=""):
        return str(self.outdir / name) if name else str(self.outdir)

    def run(self, cmd, cwd=None, stdin="", timeout=core.DEFAULT_TIMEOUT, env=None):
        return core.run(cmd, cwd=cwd or self.ex(), stdin=stdin, timeout=timeout,
                        env=dict(os.environ, **(env or {})))

    def close(self):
        pass


class DockerEnv:
    """One container per check run. Commands go in with `docker exec`."""
    kind = "docker"

    def __init__(self, image, exdir, outdir, network=False, writable=False):
        ensure_image(image)
        self.image = image
        self.exdir = exdir
        self.outdir = outdir
        self.network = network
        self.writable = writable
        self.python = "python3"
        self.name = None
        self._start()

    def _start(self):
        self.name = "z2d-run-" + uuid.uuid4().hex[:12]
        cmd = ["docker", "run", "-d", "--rm", "--init", "--name", self.name,
               "--user", f"{os.getuid()}:{os.getgid()}", "-e", "HOME=/tmp",
               "--cap-add", "SYS_PTRACE",     # LeakSanitizer needs it
               "-v", f"{self.exdir}:{EX_MOUNT}" + ("" if self.writable else ":ro"),
               "-v", f"{self.outdir}:{OUT_MOUNT}", "-w", EX_MOUNT]
        if not self.network:
            cmd += ["--network", "none"]
        cmd += [self.image, "sleep", "3600"]
        code, _, err = core.run(cmd, timeout=120)
        if code != 0:
            raise core.Skip(f"could not start a container from {self.image}: {(err or '').strip()[:300]}")

    def ex(self, name=""):
        return f"{EX_MOUNT}/{name}" if name else EX_MOUNT

    def out(self, name=""):
        return f"{OUT_MOUNT}/{name}" if name else OUT_MOUNT

    def run(self, cmd, cwd=None, stdin="", timeout=core.DEFAULT_TIMEOUT, env=None):
        full = ["docker", "exec", "-i", "-w", cwd or EX_MOUNT]
        for key, value in (env or {}).items():
            full += ["-e", f"{key}={value}"]
        code, out, err = core.run(full + [self.name] + list(cmd), stdin=stdin, timeout=timeout)
        if code is None:
            # The exec client was killed, but the program is still running inside. Start afresh.
            self.close()
            self._start()
        return code, out, err

    def close(self):
        if self.name:
            core.run(["docker", "rm", "-f", self.name], timeout=60)
            self.name = None


def open_env(name, needs, image, stack, exdir, outdir, network=False, writable=False):
    if choose(name, needs, image, stack) == "native":
        return NativeEnv(exdir, outdir)
    return DockerEnv(image, exdir, outdir, network=network, writable=writable)
