# Contributing

Everything in this project is data that a small set of tools reads. Adding a lesson, an exercise, a language or an installer stack does not require changing those tools.

After any change, run the self-test. It must finish with no failures:

```console
$ python3 tools/build_guide.py
$ python3 tools/selftest.py
```

## Add or edit a lesson

Lessons are Markdown files in `content/<track>/NN-name.md`. The number sets the order.

```markdown
---
title: Pointers
summary: One sentence shown under the title and on the home page.
---

## A heading

Text with `code`, **bold** and a [link to another lesson](c/08-memory).
```

Supported: `##` and `###` headings, paragraphs, `-` and `1.` lists (one level), fenced code blocks with a language (`c`, `python`, `java`, `elixir`, `sql`, `bash`, `console`, `text`), `>` callouts (start with `**Warning:**` for the warning style), pipe tables (write `\|` for a literal pipe in a cell), `` `code` ``, `**bold**`, `*italic*` and links.

In `console` blocks, lines starting with `$ ` are commands and the rest is output.

Then rebuild the HTML, and commit both the Markdown and the generated files in `guide/`:

```console
$ python3 tools/build_guide.py
```

## Add a track

1. Create `content/<track>/` with at least one lesson.
2. Add one line to `content/tracks.json`: `{"id": "<track>", "title": "...", "blurb": "..."}`. The order in that file is the order on the home page.
3. Put its exercises in `exercises/<track>/`.

## Add an exercise

Create `exercises/<track>/NN-name/` with:

| File | Purpose |
| --- | --- |
| `exercise.json` | title, the lesson it belongs to, and the tests |
| `README.md` | the task, shown in the lesson's "Test yourself" box |
| starter files | what the learner edits. They must **fail** the tests. |

and `solutions/<track>/NN-name/` with a reference solution that **passes**. The self-test checks both.

Every `exercise.json` has `title`, `lesson` (such as `c/07-pointers`), `kind`, and optionally `hints` (a list, shown one at a time after repeated failures) and `timeout` in seconds.

### kind: program

Builds the code if the language needs it, then runs it once per case and compares standard output.

```json
{
  "title": "Area and perimeter",
  "lesson": "c/02-types-and-variables",
  "kind": "program",
  "lang": "c",
  "cases": [
    {"name": "3 by 4", "stdin": "3 4\n", "stdout": "area: 12\nperimeter: 14\n"},
    {"name": "no argument", "args": [], "stdout": "", "exit": 1}
  ]
}
```

- `lang`: one language from the table in `check.py`, or `"any"` to let the learner choose. With `"any"`, ship a `solution.py` starter and a Python reference solution; reference solutions in other languages are checked too if present.
- `sources`: the files to compile, when there is more than the language's default file. A C exercise that tests functions uses `["mylib.c", "test_main.c"]`, where `test_main.c` is a driver you provide.
- A case may have `stdin`, `args`, `stdout`, `exit` (default 0) and `files` (a map of file name to content, created in the directory the program runs in).
- `stdin_py`: a Python expression that builds a large input, used in place of `stdin`. Example: `"'200000\\n' + ' '.join(str(i) for i in range(200000)) + '\\n'"`.

### kind: pyfunc

Imports `solution.py` and calls its functions.

```json
{
  "kind": "pyfunc",
  "cases": [
    {"call": "is_even", "args": [4], "expect": true},
    {"call": "parse_age", "args": ["abc"], "raises": "ValueError", "name": "rejects text"}
  ],
  "tests": "tests.py"
}
```

`tests` is optional: a file of `test_*` functions that use plain `assert`. The first line of a function's docstring is its display name.

### kind: harness

Runs a test file that you ship with the exercise.

```json
{
  "kind": "harness",
  "lang": "java",
  "build": ["javac", "-d", "{build}", "Stack.java", "Tests.java"],
  "run": ["java", "-cp", "{build}", "Tests"]
}
```

`{build}` is a temporary directory. If the test program prints lines of the form `ok - name` and `not ok - name: reason`, each becomes one result. Otherwise the exit code decides.

### kind: sql

Runs the learner's `query.sql` on a fresh database, after `seed.sql`.

```json
{
  "kind": "sql",
  "seed": "seed.sql",
  "expect": {"columns": ["title", "price"], "ordered": true, "rows": [["Dune", 12.5]]},
  "checks": [
    {"name": "the row was added", "query": "SELECT COUNT(*) FROM books", "rows": [[13]]},
    {"name": "a duplicate is rejected", "query": "INSERT INTO ...", "error": true}
  ],
  "require": ["begin", "commit"]
}
```

Use `expect` for an exercise answered by one `SELECT`, and `checks` for scripts that change data or create tables. SQLite is the default engine. Add `"engine": "postgres"` for PostgreSQL-only features.

### kind: sandbox

For Git and shell tasks. The learner works in `~/zero2dev-work/<track>/<name>/`.

```json
{
  "kind": "sandbox",
  "setup": ["git init -q . && git symbolic-ref HEAD refs/heads/main"],
  "checks": [
    {"name": "there are at least 2 commits", "cmd": "git rev-list --count HEAD", "min": 2},
    {"name": "you are on main", "cmd": "git branch --show-current", "stdout": "main"}
  ]
}
```

A check passes when the command exits with 0 (or `exit`) and its output satisfies `stdout`, `contains`, `regex` or `min` if given. The reference solution is a `solution.sh` that is run inside the sandbox.

## Add a language

Add one entry to `LANGS` in `check.py` (file name, required executables, installer stack, starter text) and one branch in `build()` with its compile and run commands. It is then available for every `"lang": "any"` exercise.

## Add an installer stack

See [setup/README.md](setup/README.md): two shell functions and one line in the list.
