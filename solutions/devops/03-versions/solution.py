import re


def parse(version):
    text = version[1:] if version.startswith("v") else version
    parts = text.split(".")
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        raise ValueError(f"not a version: {version}")
    return tuple(int(part) for part in parts)


def bump(version, part):
    major, minor, patch = parse(version)
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    if part == "patch":
        return f"{major}.{minor}.{patch + 1}"
    raise ValueError(f"unknown part: {part}")


def next_version(version, commits):
    level = -1
    for message in commits:
        first = message.split("\n")[0]
        match = re.match(r"^(\w+)(\([^)]*\))?(!)?:", first)
        if "BREAKING CHANGE" in message or (match and match.group(3)):
            level = max(level, 2)
        elif match and match.group(1) == "feat":
            level = max(level, 1)
        elif match and match.group(1) == "fix":
            level = max(level, 0)
    if level < 0:
        return ".".join(str(n) for n in parse(version))
    return bump(version, ["patch", "minor", "major"][level])


def newest(versions):
    if not versions:
        raise ValueError("no versions")
    return max(versions, key=parse)
