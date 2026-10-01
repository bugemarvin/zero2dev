"""Databases and other services (catalog/services.json).

For each one the rule is: use a server the machine already has, otherwise run
it in a Docker container named z2d-<service>, bound to 127.0.0.1, with a named
volume so data survives a restart. Nothing is started that the learner did not ask for.
"""
import json
import os
import shutil
import threading
import time

from . import core, providers

SERVICES = json.loads((core.CATALOG / "services.json").read_text(encoding="utf-8"))
_up_lock = threading.Lock()


def container(name):
    return f"z2d-{name}"


def volume(name):
    return f"z2d-{name}-data"


def container_state(name):
    """'running', 'stopped' or 'absent'."""
    code, out, _ = core.run(["docker", "inspect", "-f", "{{.State.Running}}", container(name)], timeout=20)
    if code != 0:
        return "absent"
    return "running" if out.strip() == "true" else "stopped"


def native_ok(name):
    """Is there a server on this machine, outside Docker, that we can use?"""
    probe = SERVICES[name].get("native")
    if not probe or shutil.which(probe[0]) is None or os.environ.get("Z2D_SERVICES") == "docker":
        return False
    try:
        code, _, _ = core.run(probe, timeout=10)
    except core.Skip:
        return False
    return code == 0


def status(name):
    """A summary for `check.py services` and the Setup page."""
    spec = SERVICES[name]
    info = {"id": name, "name": spec["name"], "image": spec["image"], "port": spec["host_port"],
            "connect": spec["connect"], "stack": spec.get("stack")}
    if native_ok(name):
        return dict(info, state="native", detail="already installed and running on this machine: it will be used as it is")
    docker = providers.docker_state()
    if docker != "ok":
        return dict(info, state="unavailable", detail=providers.DOCKER_HELP[docker])
    state = container_state(name)
    detail = {
        "running": f"running in Docker on 127.0.0.1:{spec['host_port']}",
        "stopped": "the container exists and is stopped",
        "absent": "not started yet. It will run in Docker when needed"
                  + ("" if providers.image_present(spec["image"]) else f" (first use downloads {spec['image']})"),
    }[state]
    return dict(info, state=state, detail=detail)


def up(name):
    """Make sure the service's container is running and ready. Returns its status."""
    with _up_lock:      # two exercises asking at once must not both create the container
        return _up(name)


def _up(name):
    spec = SERVICES[name]
    docker = providers.docker_state()
    if docker != "ok":
        hint = f" Or install it directly: setup/install.sh --stack {spec['stack']}" if spec.get("stack") else ""
        raise core.Skip(f"{spec['name']} is not available. {providers.DOCKER_HELP[docker]}{hint}")
    state = container_state(name)
    if state == "absent":
        providers.ensure_image(spec["image"])
        cmd = ["docker", "run", "-d", "--name", container(name),
               "-p", f"127.0.0.1:{spec['host_port']}:{spec['container_port']}",
               "-v", f"{volume(name)}:{spec['volume']}"]
        for key, value in spec.get("env", {}).items():
            cmd += ["-e", f"{key}={value}"]
        code, _, err = core.run(cmd + [spec["image"]], timeout=180)
        if code != 0:
            core.run(["docker", "rm", "-f", container(name)], timeout=60)
            raise core.Skip(f"could not start {spec['name']} in Docker: {(err or '').strip()[-300:]}")
    elif state == "stopped":
        code, _, err = core.run(["docker", "start", container(name)], timeout=120)
        if code != 0:
            raise core.Skip(f"could not start the {spec['name']} container: {(err or '').strip()[-300:]}")
    deadline = time.time() + 90
    while time.time() < deadline:
        code, _, _ = core.run(["docker", "exec", container(name)] + spec["ready"], timeout=20)
        if code == 0:
            return status(name)
        time.sleep(1)
    raise core.Skip(f"{spec['name']} was started in Docker but did not become ready in time. "
                    f"See: docker logs {container(name)}")


def down(name, purge=False):
    """Stop the container. With purge, remove it and its data volume too."""
    if providers.docker_state() != "ok" or container_state(name) == "absent":
        if purge and providers.docker_state() == "ok":
            core.run(["docker", "volume", "rm", "-f", volume(name)], timeout=60)
        return status(name)
    if purge:
        core.run(["docker", "rm", "-f", container(name)], timeout=120)
        core.run(["docker", "volume", "rm", "-f", volume(name)], timeout=60)
    else:
        core.run(["docker", "stop", container(name)], timeout=120)
    return status(name)


def postgres_client():
    """How to run psql against a usable server: (command_prefix, description).

    Prefers the machine's own PostgreSQL. Falls back to the z2d-postgres container,
    starting it if needed, and then runs psql inside that container, so the
    learner does not even need a psql client installed.
    """
    if native_ok("postgres"):
        return ["psql"], "native"
    up("postgres")
    return ["docker", "exec", "-i", container("postgres"), "psql", "-U", "postgres"], "docker"
