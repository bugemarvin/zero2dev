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
<script>try{{var t=localStorage.getItem("z2d-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body data-root="../../" data-lesson="{id}">
<header class="topbar">
<button class="icon-btn" id="menu-btn" aria-label="Lessons menu">&#9776;</button>
<a class="brand" href="../../index.html">zero2dev</a>
<button class="icon-btn" id="theme-btn" aria-label="Switch light and dark theme">&#9680;</button>
</header>
<div class="layout">
<nav class="sidebar" id="sidebar" aria-label="Lessons"></nav>
<main class="lesson">
<p class="crumb">{track_title} · lesson {number} of {count}</p>
<h1>{title}</h1>
{lede}{body}
{practice}
<nav class="pager">{prev}{next}</nav>
</main>
</div>
<script src="../../assets/curriculum.js"></script>
<script src="../../assets/app.js"></script>
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
            body=body, practice=practice,
            prev=pager(prev_lesson, "prev", "Previous"), next=pager(next_lesson, "next", "Next"),
        )
        outputs[GUIDE / "lessons" / (lesson["id"] + ".html")] = page

    curriculum = {"tracks": [{
        "id": t["id"], "title": t["title"], "blurb": t.get("blurb", ""),
        "lessons": [{
            "id": l["id"], "title": l["meta"]["title"], "summary": l["meta"].get("summary", ""),
            "exercises": [{"id": e["id"], "title": e["title"]} for e in exercises.get(l["id"], [])],
        } for l in lessons if l["track"] is t],
    } for t in tracks]}
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
    print(f"guide: {len(outputs) - 1} lessons, {written} files written, {len(stale)} removed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
