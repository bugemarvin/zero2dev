# zero2dev

Learn to program on your own computer, from the first terminal command to microservices. Read a lesson, write the code in the browser or in your own editor, and run tests that tell you at once whether it works.

Two things live in this repository:

- **the learning app**: 132 lessons and 140 exercises in 14 tracks, with a checker that runs your code using the tools on your machine;
- **`setup/`**: a quick installer for a developer machine (Windows with WSL2, Ubuntu, Debian), where you pick the stacks you want.

## Start

```console
$ git clone https://github.com/bugemarvin/zero2dev.git
$ cd zero2dev
$ python3 app.py
```

That opens the app at `http://127.0.0.1:4750`. It needs only Python 3. No account, no cloud: everything runs on your computer and stays there.

1. Open **Setup** to see what your machine already has, and tick the tracks you want.
2. Open a lesson. The lesson is on the left, and a workspace panel on the right holds the editor, the command line, **Run tests** and the results. Resize it, make it full width, or close it.
3. Your progress shows on the home page.

Prefer a terminal and your own editor? The same checker works from the command line:

```console
$ python3 check.py next          # what to do next
$ python3 check.py c/01-hello    # run the tests of one exercise
$ python3 check.py progress
```

To read only, with nothing running, open `guide/index.html` in a browser.

## Tracks

| Track | What you learn |
| --- | --- |
| Start here | how programs run, the terminal, files, pipes, first shell scripts |
| Git | commits, branches, merging, conflicts, remotes, undoing, rebase, pull requests |
| Bash scripting | quoting, tests, loops, functions, text processing, robust scripts, automation |
| C | compiling, pointers, memory, structs, files, Makefiles, debugging |
| Python | the language from basics to classes, generators, testing and typing |
| Data structures and algorithms | Big-O to graphs, dynamic programming and segment trees, in any language |
| SQL and PostgreSQL | queries, joins, schema design, indexes, transactions, window functions, JSON |
| Java | classes, interfaces, collections, generics, exceptions, streams |
| Elixir | pattern matching, recursion, processes, GenServer |
| JavaScript and TypeScript | the language, modules, async, Node, an HTTP server, Express, types, the DOM |
| React | components, props, state, lists, forms, effects, data, hooks, context |
| Next.js | app router, layouts, server and client components, routes, data, server actions |
| Docker | images, Dockerfiles, volumes, Compose, an app with a data store |
| Microservices | calls between services, a gateway, a queue and worker, resilience |

Choose your own. Nothing forces an order beyond what a lesson says it builds on.

## It uses your machine

The app never installs anything behind your back, and never sends your code anywhere.

- **A tool you already have is used as it is.** Setup shows its version and says there is nothing to do.
- **A language you do not have can run in Docker.** With Docker installed, the C, Java, Elixir, Go, Rust, Ruby and JavaScript exercises run in a container of the official image, so you can start a track without installing its toolchain.
- **Databases start on demand.** An exercise that needs PostgreSQL uses a server already on your machine, or starts a container named `z2d-postgres`, reachable only from your computer.
- **Frameworks need one download.** React, Next.js and Express come from npm. Setup has a button for each package set; after that they work offline.

```console
$ python3 check.py doctor               # what is installed, what Docker can supply, what is missing
$ python3 check.py stacks               # each track and whether this machine is ready for it
$ python3 check.py services             # databases: status
$ python3 check.py services up postgres
$ python3 check.py prefetch react next  # download in advance, for offline use
```

### What ends up on your machine, and how to remove it

| What | Where | Remove with |
| --- | --- | --- |
| your work on Git and shell exercises, and npm package sets | `~/zero2dev-work/` | delete the folder |
| service containers and their data | Docker, named `z2d-postgres` and so on | `python3 check.py services down --purge` |
| Docker images | Docker | `docker rmi IMAGE` |
| tools installed by `setup/install.sh` | the system, or your home folder for mise and rustup | your package manager |
| progress and chosen tracks | `.progress.json`, `.profile.json` in this folder | delete the files |

## Is the local server safe?

`app.py` runs your code, which is its purpose, so it is locked down: it listens on `127.0.0.1` only, refuses requests whose `Host` or `Origin` is not its own, and requires a token that only its own pages can read. Nobody else on your network can reach it. Do not put it behind a proxy that exposes it.

## Install the tools

You can install everything a track needs with one script, or let Docker stand in for what is missing.

**Windows** (from an Administrator PowerShell, inside the `setup` folder):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Stacks node,java,postgres -Docker
```

The first run installs WSL2 and Ubuntu and asks for a restart. Run it again afterwards to install the toolchains. Then work inside Ubuntu.

**Ubuntu, Debian, or inside WSL:**

```console
$ ./setup/install.sh                             # menu
$ ./setup/install.sh --stack node,java,postgres
$ ./setup/install.sh --all
$ ./setup/install.sh --list
```

Stacks: `core` (always: C toolchain, gdb, valgrind, git, GitHub CLI), `python`, `node`, `java`, `elixir`, `go`, `rust`, `ruby`, `postgres`, `sqlite`, `redis`, `docker`. Details in [setup/README.md](setup/README.md).

Linux, WSL and macOS are supported hosts for the app. Windows without WSL is not.

## Any language for algorithms

The data structures track is checked by input and output, so every exercise can be solved in C, C++, Python, Java, Elixir, JavaScript, TypeScript, Go, Rust or Ruby. In the app, pick the language above the editor. In a terminal:

```console
$ python3 check.py start dsa/01-max-of-list --lang java
$ python3 check.py dsa/01-max-of-list --lang java
```

## Layout

```text
app.py       the local web app
check.py     the terminal checker
z2d/         the engine: exercise runner, Docker fallback, services, server
catalog/     languages, services and npm package sets, as data
content/     lesson sources in Markdown
guide/       the lessons as static HTML, plus the app's pages
exercises/   one folder per exercise: task, starter files, tests
solutions/   reference solutions
setup/       install.sh (Linux, WSL) and install.ps1 (Windows)
tools/       build_guide.py, selftest.py, test_app.py
```

## Contributing

A new lesson, exercise, language, service or whole stack is data plus content: see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
