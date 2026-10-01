# Contributing

zero2dev is open source under the [MIT licence](LICENSE), and it grows through contributions: a fixed typo, a clearer sentence, a better hint, a new exercise, a whole new stack. All of them are welcome. Be kind to each other while doing it: see the [code of conduct](CODE_OF_CONDUCT.md).

## The rules

1. **Your contribution is under the MIT licence**, like the rest of the project. By opening a pull request you confirm that you wrote it, or that its licence allows it to be used here and you named the source. Do not paste from books, courses or sites whose text you may not reuse.
2. **Small pull requests.** One lesson, one exercise or one fix at a time is reviewed in a day. A thousand lines wait for weeks. For a new stack, send the first lesson and exercise first.
3. **Talk before big work.** For a new stack or a change to the engine, open an issue first (there is a "Propose a new stack" form). It saves you from building something that will not fit.
4. **Every exercise proves itself.** It has a task (`README.md`), hints, starter files that **fail** the tests, and a reference solution in `solutions/` that **passes**. `tools/selftest.py` checks exactly that.
5. **Every lesson has a quiz**, and at least one exercise unless it is reading only.
6. **Write for a beginner whose first language may not be English.** Short sentences. One idea per paragraph. Explain a term the first time it appears. No slang, no "simply" or "just". Show an example before the rule.
7. **Teach what is true today.** Use current, stable versions and practices. Say where a thing is an opinion.
8. **Offline first.** A learner must be able to work without the internet once things are installed. No trackers, no analytics, no external fonts or scripts, no accounts.
9. **The engine stays in the Python standard library**, and the pages stay plain HTML, CSS and JavaScript without a build step. New stacks are data, not new engine code, wherever possible.
10. **Never weaken the security of the local server** (see [SECURITY.md](SECURITY.md)), and never commit secrets, keys or personal data.
11. **Keep it friendly.** Jokes are welcome if every learner can laugh at them.

## Branches, and the way a change travels

| Branch | What it is | Who changes it |
| --- | --- | --- |
| `main` | the released guide. The website shows it, and the install line downloads it. | only a pull request from `development` (or a `hotfix/...` branch), merged by a maintainer |
| `development` | where finished work comes together and is tried before a release | pull requests from contributors |
| `master` | not used. The name is reserved so that nobody creates it by mistake. | nobody |
| `feature/...`, `fix/...`, `content/...` | your work, in your fork | you |

```text
your branch  --pull request-->  development  --pull request-->  main
                 review + CI                    maintainers, when ready to release
```

**Nobody pushes to `main`, `master` or `development` directly**, contributors with write access included. GitHub refuses it. Those branches change only through a pull request that has:

- an approving review from a code owner (see `.github/CODEOWNERS`);
- every review conversation resolved;
- green checks from CI.

They also cannot be deleted or force-pushed. Only repository administrators can step around these rules, for emergencies.

### What CI checks on every pull request

| Check | What it does | Must pass to merge |
| --- | --- | --- |
| Branch flow | a pull request into `main` comes from `development` or `hotfix/...` | yes |
| Guide is built | `tools/build_guide.py --check`: the generated pages match the sources, and every quiz is well formed | yes |
| App and API tests | `tools/test_app.py`: the security rules of the local server and its API | yes |
| Lint | ShellCheck on the install scripts, and a syntax check of the Python and JavaScript | yes |
| Exercises | `tools/selftest.py`: every starter fails and every reference solution passes | reported |
| Installer | `setup/install.sh` for each stack on a clean machine, and the PowerShell scripts parsed on Windows | reported |

Run the same things on your machine first (the three commands further down). It is quicker than waiting for CI.

## How to contribute

1. Fork the repository on GitHub and clone your fork.
2. Start from `development`: `git switch development`, then create a branch: `git switch -c feature/vue-track`.
3. Make the change. Run the three commands below.
4. Commit with a message that says what changed, and push the branch to your fork.
5. Open a pull request **into `development`**. GitHub suggests `main`: change the base branch. The template lists what a reviewer will look for.
6. A maintainer reviews it. Expect questions and requested changes: that is normal, and not a judgement of you.
7. Maintainers release by opening a pull request from `development` into `main`.

New to Git and pull requests? The guide teaches exactly this, in [the Git track](content/git/09-pull-requests.md).

Found a mistake and do not want to fix it yourself? Open an issue. That is a contribution too.

## Before you send it

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

Code block languages with colouring: `c`, `cpp`, `python`, `java`, `elixir`, `go`, `rust`, `ruby`, `php`, `sql`, `bash`, `javascript` (also `jsx`, `typescript`, `json`), `html`, `css`, `dockerfile`, `yaml`, and `console`, where lines starting with `$ ` are commands and the rest is output. Use `text` for diagrams and sample files.

A section that applies to one system only says so in its heading: `## Windows {os=windows}`, `## Ubuntu or Debian Linux {os=linux wsl}`, `## macOS {os=macos}`. The page shows the sections for the learner's system and tucks the others behind a button. The marker is removed from the title, and the section ends at the next `##` heading.

## Quizzes

A lesson's quiz lives next to it, as `content/<track>/NN-name.quiz.json`: a list of questions.

```json
[
  {"q": "Which command shows the folder you are in?", "options": ["ls", "pwd", "cd"], "answer": 1,
   "why": "pwd: print working directory."},
  {"q": "What does this print?", "code": "print(7 // 2)", "accept": ["3"], "why": "// is integer division."}
]
```

- A choice question has `options` and `answer`, the position of the right option counting from 0 (or a list of positions, any of which is right). The options are shuffled when shown.
- A typed-answer question has `accept`: the accepted texts. Upper and lower case and extra spaces do not matter.
- `why` is shown after the answer. `code` is shown as a code block. Text in backticks is shown as code.

Aim for three to five questions that test understanding, not memory of a sentence.

## Paths

`content/paths.json` lists the career paths: an `id`, a `title`, a `blurb`, an `outcome`, the `stages` (each with a `title`, a `why` and the `tracks` in order), and `electives`: optional tracks the learner can add.

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

Add `"workspace": "react"` to run inside a package set, and `"preview": {"start": [...]}` to give the app a **Start app** button. `"preview": "static"` serves the exercise folder as a web site, for pages that load the learner's JavaScript.

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

- `start` is a long-running command. It must listen on the port in the `PORT` environment variable; `{port}` in the command is replaced by it, and `{host}` by the address to bind to.
- When the language is not installed, the app runs in a container of the language's image. So listen on the address in `HOST`, not on a fixed `127.0.0.1`.
- `DATA_DIR` names an empty folder that is removed afterwards, for apps that keep data in files.
- For Compose systems use `up` and `down` in place of `start`, and `"needs": ["docker"]`. Publish one port as `127.0.0.1:${PORT}:<container port>`.
- A request may have `method`, `path`, `body` (JSON), `raw` (a body sent as written), `headers`.
- Expectations: `status`, `json` (exact), `json_contains` (a subset), `contains` and `not_contains` (a string or a list), `header`.
- `retry`: keep asking for that many seconds, for results that arrive later.

### kind: web

For HTML and CSS. The page is parsed and the cascade applied by the checker itself: no browser is involved.

```json
{"kind": "web", "page": "index.html", "styles": ["style.css"], "edit": ["style.css"],
 "checks": [
   {"name": "there is exactly one h1", "select": "body h1", "count": 1},
   {"name": "every image has an alt text", "select": "img", "attr": {"alt": true}},
   {"name": "nav links have no underline", "select": "nav a", "style": {"text-decoration": "none"}},
   {"name": "a hovered link is underlined", "select": "nav a", "state": "hover", "style": {"text-decoration": "underline"}},
   {"name": "from 700px there are two columns", "select": ".layout", "media": "min-width: 700px",
    "style": {"grid-template-columns": "2fr 1fr"}}
 ]}
```

- `select` is a CSS selector. `count`, `min` and `max` test how many elements match. `text` is the exact text of the first match, and `contains` a piece of text in any match.
- `attr` tests attributes of every match: a value, `true` for "present and not empty", `false` for "absent".
- `style` tests the value each matched element ends up with: its own declaration by specificity and order, an inherited one for inherited properties, with `var(--x)` resolved. A value can be a list of accepted spellings, `null` in the list means "not set", and `"~text"` means "contains".
- `state` (`hover`, `focus`, ...) and `media` select the rules that apply in that state or inside that media query.
- `{"doctype": true}` and `{"valid": true}` test the doctype and that every element is closed in the right order.
- Values are compared as written, after light normalisation (case, spaces, `#fff` and `#ffffff`, `0px` and `0`). Of the shorthands only `margin`, `padding` and a one-colour `background` are expanded, so name in the task the property you test.

The app gives every web exercise an **Open preview** button.

### kind: mongo

Runs the learner's `query.js` in `mongosh` on a fresh database, after `seed.js`.

```json
{"kind": "mongo", "seed": "seed.js", "require": ["$gt"],
 "expect": {"ordered": true, "docs": [{"title": "Dune", "price": 12.5}]},
 "checks": [{"name": "book 7 is deleted", "eval": "db.books.findOne({ _id: 7 })", "expect": null}]}
```

`expect` judges the variable `result` of the script: `docs` for a list of documents (a cursor is read for you), or `value` for anything else. Each check evaluates an expression afterwards; `"error": true` means it must fail. Give seeded documents a simple `_id`, so results can be compared.

### kind: redis

Runs the learner's `commands.redis`, one command per line, on an empty database (number 15), after `seed.redis`.

```json
{"kind": "redis", "require": ["ZINCRBY"],
 "checks": [{"name": "sam has 1300 points", "cmd": "ZSCORE game:scores sam", "expect": "1300"},
            {"name": "the session expires", "cmd": "TTL session:abc", "min": 250, "max": 300},
            {"name": "the tags", "cmd": "SMEMBERS tags", "expect": ["a", "b"], "unordered": true}]}
```

A check runs a command with `redis-cli` and compares its reply lines. A reply of nil is an empty list.

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

`needs` are the executables looked for on the machine. `image` is the Docker image used when they are missing. `docker_cache` names a folder inside the container whose content is kept between runs (Go's build cache). Placeholders: `{sources}`, `{src}` (the first source), `{out}` (a temporary build folder), `{main}`, `{python}`. `stack` is the `setup/install.sh` stack that installs it.

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

`catalog/install.json` holds, per stack, what the **Install** box of a track's first lesson shows: a `name`, the commands for `linux` (Ubuntu, Debian, WSL) and `mac` (Homebrew), a `check` command, and an optional `note`.

## The engine

`z2d/` is standard-library Python.

| Module | Role |
| --- | --- |
| `runner.py` | the exercise kinds |
| `webcheck.py` | HTML parsing, CSS selectors and the cascade, for the `web` kind |
| `toolchains.py`, `providers.py` | build and run commands, natively or in a container |
| `services.py`, `workspaces.py` | databases and package sets |
| `doctor.py` | what the machine has |
| `server.py`, `api.py`, `jobs.py` | the local web app |
| `platforminfo.py`, `background.py` | which system this is; running in the background and at login |
| `cli.py` | the terminal commands |
