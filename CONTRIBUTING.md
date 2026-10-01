# Contributing

Almost everything here is data that a small engine reads. A new lesson, exercise, language, service or whole stack does not require changing the engine.

After any change, these three must pass:

```console
$ python3 tools/build_guide.py      # regenerate the HTML and catalog/starters.json
$ python3 tools/selftest.py         # every exercise: the starter fails, the reference solution passes
$ python3 tools/test_app.py         # the local server: security rules and API
```

`selftest.py` takes track names to run a part: `python3 tools/selftest.py react next`. `Z2D_PROVIDER=docker` forces languages to run in containers, and `Z2D_SERVICES=docker` forces databases to.

## Add a whole stack

A stack such as "Vue" or "Go web services" is four pieces of data:

1. **A language**, if it is not in `catalog/toolchains.json` yet (see below).
2. **A package set**, if it needs npm packages: a folder in `catalog/workspaces/`.
3. **A track**: a line in `content/tracks.json`, lessons in `content/<track>/`.
4. **Exercises** in `exercises/<track>/` with solutions in `solutions/<track>/`.

## Lessons

Markdown files in `content/<track>/NN-name.md`. The number sets the order.

```markdown
---
title: Pointers
summary: One sentence shown under the title and on the home page.
---

## A heading

Text with `code`, **bold** and a [link to another lesson](c/08-memory).
```

Supported: `##` and `###` headings, paragraphs, `-` and `1.` lists (one level), fenced code blocks with a language, `>` callouts (start with `**Warning:**` for the warning style), pipe tables (write `\|` for a pipe inside a cell), `` `code` ``, `**bold**`, `*italic*`, links.

Code block languages with colouring: `c`, `python`, `java`, `elixir`, `sql`, `bash`, `javascript` (also `jsx`, `typescript`), `dockerfile`, `yaml`, and `console`, where lines starting with `$ ` are commands and the rest is output. Use `text` for diagrams and sample files.

## Tracks

`content/tracks.json` lists the tracks in home-page order:

```json
{"id": "react", "title": "React", "blurb": "One sentence.", "needs": ["toolchain:javascript", "workspace:react"]}
```

`needs` drives the Setup page and `check.py stacks`. Entries are `toolchain:<language>`, `tool:<bash|git|make|docker|npm>`, `service:<name>` or `workspace:<name>`.

## Exercises

`exercises/<track>/NN-name/` holds:

| File | Purpose |
| --- | --- |
| `exercise.json` | title, lesson, kind, tests |
| `README.md` | the task, shown in the lesson's "Test yourself" box |
| starter files | what the learner edits. They must **fail** the tests. |
| anything else | test drivers, data, given code. Shown read-only in the app. |

`solutions/<track>/NN-name/` mirrors the files the learner edits, with a solution that **passes**.

Common keys in `exercise.json`: `title`, `lesson` (such as `c/07-pointers`), `kind`, `hints` (a list, revealed one at a time), `timeout` in seconds, and `edit`: the files the learner may change, when that cannot be derived.

### kind: program

Builds if the language needs it, runs once per case, compares standard output.

```json
{
  "kind": "program", "lang": "c",
  "cases": [
    {"name": "3 by 4", "stdin": "3 4\n", "stdout": "area: 12\nperimeter: 14\n"},
    {"name": "no argument", "args": [], "stdout": "", "exit": 2},
    {"name": "makes a copy", "args": ["a.txt"], "files": {"a.txt": "A\n"}, "then": "test -f backup/a.txt.bak"}
  ]
}
```

- `lang`: a key of `catalog/toolchains.json`, or `"any"` to let the learner choose. With `"any"`, ship a `solution.py` starter; reference solutions in other languages are checked too if present.
- `sources`: the files to build, when not the language's default file. A C exercise that tests functions uses `["mylib.c", "test_main.c"]`.
- A case may have `stdin`, `args`, `stdout`, `exit` (default 0), `files` (created where the program runs) and `then` (a shell command run afterwards in that folder, which must succeed).
- `stdin_py`: a Python expression that builds a large input, in place of `stdin`.

### kind: pyfunc

Imports `solution.py` and calls its functions.

```json
{"kind": "pyfunc", "tests": "tests.py",
 "cases": [{"call": "is_even", "args": [4], "expect": true},
           {"call": "parse_age", "args": ["abc"], "raises": "ValueError"}]}
```

`tests` is optional: `test_*` functions using plain `assert`. A docstring's first line is the display name.

### kind: harness

Runs a test program shipped with the exercise.

```json
{"kind": "harness", "lang": "java",
 "build": ["javac", "-d", "{build}", "Stack.java", "Tests.java"],
 "run": ["java", "-cp", "{build}", "Tests"]}
```

Output is read as TAP: `ok - name`, `not ok - name: reason`, and the numbered form with a YAML block that `node --test` and Vitest print. With no such lines, the exit code decides.

Add `"workspace": "react"` to run inside a package set, and `"preview": {"start": [...]}` to give the app a **Start app** button.

### kind: http

The checker starts an app, calls it and stops it.

```json
{"kind": "http", "lang": "javascript", "workspace": "node", "edit": ["server.mjs"],
 "start": ["node", "server.mjs"],
 "requests": [
   {"name": "creates a todo", "method": "POST", "path": "/todos", "body": {"title": "x"},
    "status": 201, "json": {"id": 1, "title": "x", "done": false}},
   {"name": "the worker finishes", "path": "/jobs/1", "json_contains": {"status": "done"}, "retry": 12}
 ]}
```

- `start` is a long-running command. It must listen on the port in the `PORT` environment variable; `{port}` in the command is replaced by it.
- For Compose systems use `up` and `down` in place of `start`, and `"needs": ["docker"]`. Publish one port as `127.0.0.1:${PORT}:<container port>`.
- A request may have `method`, `path`, `body` (JSON), `raw` (a body sent as written), `headers`.
- Expectations: `status`, `json` (exact), `json_contains` (a subset), `contains` and `not_contains` (a string or a list), `header`.
- `retry`: keep asking for that many seconds, for results that arrive later.

### kind: sql

Runs the learner's `query.sql` on a fresh database, after `seed.sql`.

```json
{"kind": "sql", "seed": "seed.sql", "require": ["begin", "commit"],
 "expect": {"columns": ["title", "price"], "ordered": true, "rows": [["Dune", 12.5]]},
 "checks": [{"name": "a duplicate is rejected", "query": "INSERT INTO ...", "error": true}]}
```

SQLite by default. `"engine": "postgres"` uses the machine's server or the `z2d-postgres` container.

### kind: sandbox

For Git, shell and Docker tasks. The learner works in `~/zero2dev-work/<track>/<name>/`.

```json
{"kind": "sandbox", "needs": ["docker"],
 "setup": ["cp \"$Z2D_EX\"/files/* ."],
 "checks": [{"name": "you are on main", "cmd": "git branch --show-current", "stdout": "main"}]}
```

A check passes when the command exits 0 (or `exit`) and its output satisfies `stdout`, `contains`, `regex` or `min` if given. The reference solution is a `solution.sh`, run inside the sandbox.

## Languages

One entry in `catalog/toolchains.json`:

```json
"go": {
  "name": "Go", "file": "main.go", "needs": ["go"], "stack": "go", "image": "golang:1-alpine",
  "compiled": true,
  "build": ["go", "build", "-o", "{out}/prog", "{sources}"],
  "run": ["{out}/prog"],
  "version": ["go", "version"],
  "starter": "package main\n..."
}
```

`needs` are the executables looked for on the machine. `image` is the Docker image used when they are missing. Placeholders: `{sources}`, `{src}` (the first source), `{out}` (a temporary build folder), `{main}`, `{python}`. `stack` is the `setup/install.sh` stack that installs it.

## Services

One entry in `catalog/services.json`: the image, the container port, the host port (bound to `127.0.0.1`), environment, the data volume path, a `ready` command run inside the container, and optionally a `native` command that succeeds when the machine already has a usable server.

## Package sets

`catalog/workspaces/<name>/` holds `package.json`, `package-lock.json`, any shared config, and:

```json
{"title": "React", "needs": ["node", "npm"], "stack": "node", "setup": [["npm", "ci", "--no-audit", "--no-fund"]]}
```

It is installed once into `~/zero2dev-work/.workspaces/<name>/`. An exercise with `"workspace": "<name>"` is copied into `run/<id>/` beneath it for each run, so imports resolve against the shared `node_modules`.

## Installer stacks

See [setup/README.md](setup/README.md): two shell functions and one line in the list.

## The engine

`z2d/` is standard-library Python.

| Module | Role |
| --- | --- |
| `runner.py` | the exercise kinds |
| `toolchains.py`, `providers.py` | build and run commands, natively or in a container |
| `services.py`, `workspaces.py` | databases and package sets |
| `doctor.py` | what the machine has |
| `server.py`, `api.py`, `jobs.py` | the local web app |
| `cli.py` | the terminal commands |
