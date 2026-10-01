#!/usr/bin/env python3
"""Build the offline guide from the Markdown in content/.

    python3 tools/build_guide.py           write guide/lessons/**.html and guide/assets/curriculum.js
    python3 tools/build_guide.py --check   exit 1 if the generated files are out of date

Standard library only. The generated HTML is committed, so learners never run this.

Supported Markdown: front matter (title, summary), ## and ### headings,
paragraphs, - and 1. lists, fenced code blocks, > callouts, pipe tables,
`code`, **bold**, *italic*, [links](url). A link to another lesson is written
as its id, for example [pointers](c/07-pointers).
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
GUIDE = ROOT / "guide"
EXERCISES = ROOT / "exercises"


class BuildError(Exception):
    pass


# ---------------------------------------------------------------- markdown

def esc(text):
    return html.escape(text, quote=False)


def make_inline(lesson_ids, here):
    """Return the inline formatter for a page whose id is `here` (track/name)."""

    def link(match):
        text, url = match.group(1), match.group(2)
        if url in lesson_ids:
            track, name = url.split("/")
            return f'<a href="../{track}/{name}.html">{text}</a>'
        if re.match(r"^(https?:|#)", url):
            extra = ' rel="noopener"' if url.startswith("http") else ""
            return f'<a href="{html.escape(url)}"{extra}>{text}</a>'
        raise BuildError(f"{here}: link target not found: {url}")

    def inline(text):
        # Lift code spans out first, so bold and links can wrap them safely.
        codes = []

        def stash(match):
            codes.append("<code>" + esc(match.group(1)) + "</code>")
            return f"\0{len(codes) - 1}\0"

        text = re.sub(r"`([^`]+)`", stash, text)
        text = esc(text)
        text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])", r"<em>\1</em>", text)
        text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", link, text)
        return re.sub(r"\0(\d+)\0", lambda m: codes[int(m.group(1))], text)

    return inline


def split_row(line):
    cells = line.strip().strip("|").replace("\\|", "\1").split("|")
    return [c.strip().replace("\1", "|") for c in cells]


def markdown(text, inline, heading_shift=0):
    """Convert the supported Markdown subset to HTML."""
    lines = text.split("\n")
    out = []
    i = 0
    open_os = False       # inside a section whose heading carried {os=...}

    def is_block_start(line):
        return (line.startswith(("#", "```", "> ", "|")) or re.match(r"^(- |\d+\. )", line) is not None)

    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue

        if line.startswith("```"):
            lang = line[3:].strip() or "text"
            i += 1
            code = []
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i])
                i += 1
            if i >= len(lines):
                raise BuildError("unclosed code block")
            i += 1
            out.append(f'<pre><code class="lang-{lang}">{esc(chr(10).join(code))}</code></pre>')
            continue

        heading = re.match(r"^(#{2,4}) (.+)$", line)
        if heading:
            level = min(len(heading.group(1)) + heading_shift, 6)
            title = heading.group(2).strip()
            # "## Windows {os=windows}" marks the section as being for one system. It ends at the next ## heading.
            marker = re.search(r"\s*\{os=([a-z ]+)\}$", title)
            if len(heading.group(1)) == 2 and open_os:
                out.append("</div>")
                open_os = False
            if marker:
                title = title[:marker.start()]
                if len(heading.group(1)) == 2:
                    out.append(f'<div class="os-section" data-os="{marker.group(1).strip()}">')
                    open_os = True
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
            anchor = f' id="{slug}"' if heading_shift == 0 else ""
            out.append(f"<h{level}{anchor}>{inline(title)}</h{level}>")
            i += 1
            continue

        if line.startswith("> ") or line == ">":
            quote = []
            while i < len(lines) and (lines[i].startswith("> ") or lines[i] == ">"):
                quote.append(lines[i][2:])
                i += 1
            body = " ".join(q for q in quote if q)
            kind = "callout warn" if body.startswith("**Warning") else "callout"
            out.append(f'<div class="{kind}"><p>{inline(body)}</p></div>')
            continue

        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            if len(rows) < 2 or not all(re.match(r"^:?-+:?$", c) for c in rows[1]):
                raise BuildError(f"table needs a header and a separator row: {rows[0]}")
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[2:])
            out.append(f'<div class="table-wrap"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
            continue

        bullet = re.match(r"^(- |\d+\. )", line)
        if bullet:
            ordered = bullet.group(1) != "- "
            pattern = r"^\d+\. " if ordered else r"^- "
            items = []
            while i < len(lines) and re.match(pattern, lines[i]):
                item = re.sub(pattern, "", lines[i])
                i += 1
                # indented lines continue the same item
                while i < len(lines) and lines[i].startswith("  ") and lines[i].strip():
                    item += " " + lines[i].strip()
                    i += 1
                items.append(f"<li>{inline(item)}</li>")
            tag = "ol" if ordered else "ul"
            out.append(f"<{tag}>" + "".join(items) + f"</{tag}>")
            continue

        # Always take the first line, so a stray "#..." line cannot stall the loop.
        para = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not is_block_start(lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline(' '.join(para))}</p>")

    if open_os:
        out.append("</div>")
    return "\n".join(out)


def front_matter(text, path):
    if not text.startswith("---\n"):
        raise BuildError(f"{path}: missing front matter")
    head, _, body = text[4:].partition("\n---\n")
    meta = {}
    for line in head.split("\n"):
        key, sep, value = line.partition(":")
        if sep:
            meta[key.strip()] = value.strip()
    if "title" not in meta:
        raise BuildError(f"{path}: front matter needs a title")
    return meta, body


# ---------------------------------------------------------------- pages

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · zero2dev</title>
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="../../assets/studio.css">
<link rel="stylesheet" href="../../assets/game.css">
<script>try{{var t=localStorage.getItem("z2d-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body data-root="../../" data-lesson="{id}">
<header class="topbar">
<button class="icon-btn" id="menu-btn" aria-label="Lessons menu">&#9776;</button>
<a class="brand" href="../../index.html">zero2dev</a>
<div class="hud" id="hud"></div>
<a class="top-link" href="../../paths.html">Paths</a>
<a class="top-link" href="../../setup.html">Setup</a>
<button class="icon-btn" id="tour-btn" aria-label="Show me around">?</button>
<button class="icon-btn" id="theme-btn" aria-label="Switch light and dark theme">&#9680;</button>
</header>
<div class="layout">
<nav class="sidebar" id="sidebar" aria-label="Lessons"></nav>
<main class="lesson">
<p class="crumb">{track_title} · lesson {number} of {count}</p>
<h1>{title}</h1>
{lede}{install}{body}
<section class="quiz-box" id="quiz" hidden></section>
{practice}
<nav class="pager">{prev}{next}</nav>
</main>
</div>
<script src="../../assets/curriculum.js"></script>
<script src="../../assets/quizzes.js"></script>
<script src="../../assets/app.js"></script>
<script src="../../assets/game.js"></script>
<script src="../../assets/studio.js"></script>
</body>
</html>
"""


def load_exercises(lesson_ids):
    """Exercises grouped by the lesson they belong to, in folder order."""
    by_lesson = {}
    for spec_path in sorted(EXERCISES.glob("*/*/exercise.json")):
        ex_id = f"{spec_path.parent.parent.name}/{spec_path.parent.name}"
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
        lesson = spec.get("lesson")
        if lesson not in lesson_ids:
            raise BuildError(f"exercise {ex_id}: lesson {lesson!r} does not exist")
        readme = spec_path.parent / "README.md"
        if not readme.exists():
            raise BuildError(f"exercise {ex_id}: missing README.md")
        by_lesson.setdefault(lesson, []).append({
            "id": ex_id,
            "title": spec["title"],
            "readme": readme.read_text(encoding="utf-8"),
            "any_lang": spec.get("kind") == "program" and spec.get("lang", "any") == "any",
        })
    return by_lesson


def render_practice(exercises, inline):
    if not exercises:
        return ""
    parts = ['<section class="practice" id="practice">', "<h2>Test yourself</h2>"]
    for ex in exercises:
        readme = re.sub(r"^# .*\n", "", ex["readme"], count=1)
        command = f"$ python3 check.py {ex['id']}"
        note = ""
        if ex["any_lang"]:
            note = ('<p class="ex-note">Any language works. The starter is Python; for another one run '
                    f'<code>python3 check.py start {ex["id"]} --lang java</code> (or c, elixir, go, ...).</p>')
        parts.append(
            f'<article class="exercise" data-ex="{ex["id"]}">\n'
            f'<h3>{esc(ex["title"])} <span class="ex-id">{ex["id"]}</span></h3>\n'
            f"{markdown(readme, inline, heading_shift=2)}\n"
            f'<p class="ex-files">Files: <code>exercises/{ex["id"]}/</code></p>\n{note}'
            f'<pre><code class="lang-console">{esc(command)}</code></pre>\n'
            "</article>"
        )
    parts.append("</section>")
    return "\n".join(parts)


def console(lines):
    text = "\n".join(line if line.startswith("#") else "$ " + line for line in lines)
    return f'<pre><code class="lang-console">{esc(text)}</code></pre>'


def render_install(track):
    """The "what this track needs" box of a track's first lesson: quick install first, then by hand."""
    catalog = ROOT / "catalog"
    langs = json.loads((catalog / "toolchains.json").read_text(encoding="utf-8"))
    services = json.loads((catalog / "services.json").read_text(encoding="utf-8"))
    install = json.loads((catalog / "install.json").read_text(encoding="utf-8"))
    core_tools = {"bash": "core", "git": "core", "make": "core", "docker": "docker", "npm": "node"}
    stacks, extras = [], []          # (stack, docker image or None), and plain sentences
    for need in track.get("needs", []):
        kind, _, name = need.partition(":")
        if kind == "toolchain":
            entry = (langs[name]["stack"], langs[name].get("image"), langs[name]["name"])
        elif kind == "service":
            entry = (services[name].get("stack"), services[name]["image"], services[name]["name"])
            extras.append(f"<strong>{esc(services[name]['name'])}</strong> is started for you: the app uses a server "
                          f"already running on this machine, or starts the Docker image <code>{services[name]['image']}</code>.")
        elif kind == "workspace":
            extras.append(f"The <strong>{esc(name)}</strong> packages come from npm, once: press <strong>Download packages</strong> "
                          f"on the Setup page, or run <code>python3 check.py prefetch {name}</code>.")
            continue
        elif name == "browser":
            extras.append("A <strong>web browser</strong>: you are using one now. Nothing to install.")
            continue
        else:
            entry = (core_tools[name], None, name)
        if entry[0] and entry[0] not in [s[0] for s in stacks]:
            stacks.append(entry)
    parts = [f'<details class="install" id="install" data-track="{track["id"]}">',
             "<summary>Install: what this track needs</summary>", '<div class="install-static">']
    if stacks:
        names = ",".join(s[0] for s in stacks)
        parts.append("<h4>Quick install</h4>")
        parts.append("<p>One command installs everything for this track. It skips what you already have.</p>")
        parts.append('<div data-os="linux wsl"><p>Ubuntu, Debian, or Ubuntu inside WSL, from the <code>zero2dev</code> folder:</p>'
                     + console([f"./setup/install.sh --stack {names}"])
                     + "<p>If something does not install, the script says why and offers to try again or to install it "
                       "another way.</p></div>")
        parts.append('<div data-os="windows"><p>Windows, from an Administrator PowerShell in the <code>setup</code> folder '
                     "(it installs WSL and Ubuntu first if needed):</p>"
                     f'<pre><code class="lang-text">powershell -ExecutionPolicy Bypass -File .\\install.ps1 -Stacks {names}</code></pre></div>')
        parts.append('<div data-os="macos"><p>macOS has no quick install script. Use the Homebrew commands below, '
                     "or let Docker run what is missing.</p></div>")
    for stack, image, label in stacks:
        info = install[stack]
        parts.append(f"<h4>{esc(info['name'])}: by hand</h4>")
        parts.append('<div data-os="linux wsl"><p>Ubuntu, Debian, WSL:</p>' + console(info["linux"]) + "</div>")
        parts.append('<div data-os="macos"><p>macOS, with <a href="https://brew.sh" rel="noopener">Homebrew</a>:</p>'
                     + console(info["mac"]) + "</div>")
        parts.append("<p>Check that it works:</p>" + console([info["check"]]))
        if info.get("note"):
            parts.append(f"<p>{esc(info['note'])}</p>")
        if image:
            parts.append(f"<p><strong>Or install nothing:</strong> with Docker running, the app runs {esc(label)} "
                         f"in the image <code>{image}</code> (one download).</p>")
    parts += [f"<p>{text}</p>" for text in extras]
    parts.append("<p>When the app is running, this box also shows what your machine already has.</p>")
    parts += ["</div>", "</details>"]
    return "\n".join(parts) + "\n"


def load_quizzes(lessons):
    """Self-test questions per lesson, from content/<track>/<lesson>.quiz.json."""
    quizzes = {}
    for lesson in lessons:
        path = CONTENT / (lesson["id"] + ".quiz.json")
        if not path.exists():
            continue
        try:
            questions = json.loads(path.read_text(encoding="utf-8"))
        except ValueError as exc:
            raise BuildError(f"{path.relative_to(ROOT)}: {exc}")
        for n, q in enumerate(questions, 1):
            where = f"{path.relative_to(ROOT)} question {n}"
            if not q.get("q"):
                raise BuildError(f"{where}: missing the question text 'q'")
            if "options" in q:
                answers = q.get("answer")
                answers = answers if isinstance(answers, list) else [answers]
                if len(q["options"]) < 2 or not answers or not all(
                        isinstance(a, int) and 0 <= a < len(q["options"]) for a in answers):
                    raise BuildError(f"{where}: 'answer' must be the position of an option, starting at 0")
            elif not q.get("accept"):
                raise BuildError(f"{where}: needs 'options' and 'answer', or 'accept'")
        quizzes[lesson["id"]] = questions
    return quizzes


def starters():
    """The original content of every file a learner edits, for the app's Reset button."""
    sys.path.insert(0, str(ROOT))
    from z2d import core, runner
    data = {}
    for ex in core.load_exercises():
        files = {}
        for name in runner.editable_files(ex):
            path = ex.dir / name
            if path.is_file():
                files[name] = path.read_text(encoding="utf-8")
        if files:
            data[ex.id] = files
    return json.dumps(data, indent=1, sort_keys=True, ensure_ascii=False) + "\n"


def build():
    """Return {path: content} for every generated file."""
    tracks = json.loads((CONTENT / "tracks.json").read_text(encoding="utf-8"))
    lessons = []  # flat, in reading order
    for track in tracks:
        files = sorted((CONTENT / track["id"]).glob("*.md"))
        if not files:
            raise BuildError(f"track {track['id']} has no lessons")
        for n, path in enumerate(files, 1):
            meta, body = front_matter(path.read_text(encoding="utf-8"), path)
            lessons.append({"id": f"{track['id']}/{path.stem}", "track": track, "number": n,
                            "count": len(files), "meta": meta, "body": body})
    lesson_ids = {l["id"] for l in lessons}
    exercises = load_exercises(lesson_ids)

    outputs = {}
    for index, lesson in enumerate(lessons):
        inline = make_inline(lesson_ids, lesson["id"])
        try:
            body = markdown(lesson["body"], inline)
            practice = render_practice(exercises.get(lesson["id"], []), inline)
        except BuildError as exc:
            raise BuildError(f"{lesson['id']}: {exc}")

        def pager(other, cls, label):
            if other is None:
                return ""
            track, name = other["id"].split("/")
            return (f'<a class="{cls}" href="../{track}/{name}.html"><span>{label}</span>'
                    f'{esc(other["meta"]["title"])}</a>')

        prev_lesson = lessons[index - 1] if index > 0 else None
        next_lesson = lessons[index + 1] if index + 1 < len(lessons) else None
        summary = lesson["meta"].get("summary", "")
        page = PAGE.format(
            title=esc(lesson["meta"]["title"]), id=lesson["id"],
            track_title=esc(lesson["track"]["title"]), number=lesson["number"], count=lesson["count"],
            lede=f'<p class="lede">{inline(summary)}</p>\n' if summary else "",
            install=render_install(lesson["track"]) if lesson["number"] == 1 else "",
            body=body, practice=practice,
            prev=pager(prev_lesson, "prev", "Previous"), next=pager(next_lesson, "next", "Next"),
        )
        outputs[GUIDE / "lessons" / (lesson["id"] + ".html")] = page

    quizzes = load_quizzes(lessons)
    paths_file = CONTENT / "paths.json"
    paths = json.loads(paths_file.read_text(encoding="utf-8")) if paths_file.exists() else []
    track_ids = {t["id"] for t in tracks}
    for path in paths:
        for stage in path["stages"]:
            unknown = [t for t in stage["tracks"] if t not in track_ids]
            if unknown:
                raise BuildError(f"paths.json: path {path['id']} names unknown tracks: {', '.join(unknown)}")
    curriculum = {"paths": paths, "tracks": [{
        "id": t["id"], "title": t["title"], "blurb": t.get("blurb", ""),
        "lessons": [{
            "id": l["id"], "title": l["meta"]["title"], "summary": l["meta"].get("summary", ""),
            "quiz": len(quizzes.get(l["id"], [])),
            "exercises": [{"id": e["id"], "title": e["title"]} for e in exercises.get(l["id"], [])],
        } for l in lessons if l["track"] is t],
    } for t in tracks]}
    outputs[ROOT / "catalog" / "starters.json"] = starters()
    outputs[GUIDE / "assets" / "quizzes.js"] = (
        "window.Z2D_QUIZZES = " + json.dumps(quizzes, indent=0, ensure_ascii=False) + ";\n")
    outputs[GUIDE / "assets" / "curriculum.js"] = (
        "window.Z2D_CURRICULUM = " + json.dumps(curriculum, indent=1, ensure_ascii=False) + ";\n")
    return outputs


def main(argv):
    try:
        outputs = build()
    except BuildError as exc:
        print(f"build error: {exc}")
        return 1
    existing = set((GUIDE / "lessons").glob("*/*.html"))
    stale = existing - set(outputs)

    if "--check" in argv:
        changed = [p for p, content in outputs.items()
                   if not p.exists() or p.read_text(encoding="utf-8") != content]
        if changed or stale:
            for p in sorted(changed) + sorted(stale):
                print(f"out of date: {p.relative_to(ROOT)}")
            print("Run: python3 tools/build_guide.py")
            return 1
        return 0

    written = 0
    for path, content in outputs.items():
        if not path.exists() or path.read_text(encoding="utf-8") != content:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
            written += 1
    for path in stale:
        path.unlink()
    print(f"guide: {len(outputs) - 3} lessons, {written} files written, {len(stale)} removed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
