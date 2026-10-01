# zero2dev

Learn to program on your own computer, from the first terminal command to shipping services. Read a lesson, take a quick quiz, write the code in the browser or in your own editor, and run tests that tell you at once whether it works.

Two things live in this repository:

- **the learning app**: 196 lessons, 673 quiz questions and 204 exercises in 25 tracks, with a checker that runs your code using the tools on your machine;
- **`setup/`**: a quick installer for a developer machine (Windows with WSL2, Ubuntu, Debian), where you pick the stacks you want.

## Never done this before?

You need a computer and nothing else. No maths, no "tech background".

1. **Get Python 3.** On Windows, run the installer in `setup/` (see [Install the tools](#install-the-tools)): it sets up Ubuntu inside Windows, with Python. On macOS and Linux it is usually there already: `python3 --version` tells you.
2. **Get this project**: `git clone https://github.com/bugemarvin/zero2dev.git`, or download it as a ZIP from GitHub and unpack it.
3. **Start the app**: in a terminal, go into the `zero2dev` folder and type `python3 app.py`. It opens in your browser.
4. On the home page choose the path **Start from zero** and press **Start**. A one-minute tour shows you around, and the first lesson explains every word as it comes.

## Start

```console
$ git clone https://github.com/bugemarvin/zero2dev.git
$ cd zero2dev
$ python3 app.py
```

That opens the app at `http://127.0.0.1:4750`. It needs only Python 3. No account, no cloud: everything runs on your computer and stays there.

1. Pick a **path** on the home page, or open any track.
2. Open a lesson. The lesson is on the left, and a workspace panel on the right holds the editor, the command line, **Run tests** and the results.
3. **Setup** shows what your machine already has, and installs or downloads what is missing.

Prefer a terminal and your own editor? The same checker works from the command line:

```console
$ python3 check.py next          # what to do next
$ python3 check.py c/01-hello    # run the tests of one exercise
$ python3 check.py progress
```

To read only, with nothing running, open `guide/index.html` in a browser. Lessons and quizzes work there too.

## Keep it running

The app can stay in the background, always at the same address, so it is one bookmark away:

```console
$ python3 app.py start           # run in the background on port 4750
$ python3 app.py status
$ python3 app.py stop
$ python3 app.py autostart on    # start it whenever you log in (off, status)
```

`autostart` uses what the system offers and needs no administrator rights: a systemd user service on Linux, a launch agent on macOS, and on Windows a small script in the Startup folder that runs the app inside WSL. The same switch is on the Setup page. `--port 5000` picks another port.

## Paths

A path is a route through the tracks towards a kind of work. Everyone starts with the same foundations, then the routes divide. Pick one on the home page, add optional tracks, and change your mind whenever you like. Nothing is locked.

| Path | Leads through |
| --- | --- |
| Start from zero | Start here, Git, Python, HTML, CSS |
| Frontend developer | HTML, CSS, JavaScript, React, Next.js |
| Backend developer | Python, SQL, MongoDB, Redis, JavaScript, Node.js, Docker, Microservices, DevOps |
| Full-stack developer | HTML, CSS, JavaScript, React, Node.js, SQL, Next.js, Docker |
| DevOps engineer | Bash, Python, Docker, DevOps, Microservices, SQL, Redis |
| Game developer | JavaScript, Game development, Data structures, C |
| Systems programmer | C, Data structures, Rust, Go |
| AI application engineer | Python, Building with LLMs, SQL, Redis, Docker |

## Tracks

| Track | What you learn |
| --- | --- |
| Start here | what programming is, how programs run, the terminal, files, pipes, first shell scripts |
| Git | commits, branches, merging, conflicts, remotes, undoing, rebase, pull requests |
| Bash scripting | quoting, tests, loops, functions, text processing, robust scripts, automation |
| C | compiling, pointers, memory, structs, files, Makefiles, debugging |
| Python | the language from basics to classes, generators, testing and typing |
| Building with LLMs | tokens and context, calling a model, prompts, structured output, tools and agents, retrieval and evaluation |
| Data structures and algorithms | Big-O to graphs, dynamic programming and segment trees, in any language |
| SQL and PostgreSQL | queries, joins, schema design, indexes, transactions, window functions, JSON |
| MongoDB | documents, queries, updates, the aggregation pipeline, indexes and schema design |
| Redis | strings and expiry, hashes, lists, sets, sorted sets, caching, rate limits, messaging |
| HTML | page structure, text, links, images, tables, forms, semantic markup and accessibility |
| CSS | selectors and the cascade, the box model, units and variables, flexbox, grid, responsive design |
| Java | classes, interfaces, collections, generics, exceptions, streams |
| Go | slices and maps, structs, interfaces, errors, goroutines and channels, an HTTP API |
| Rust | ownership and borrowing, enums and match, Option and Result, traits, iterators |
| Elixir | pattern matching, recursion, processes, GenServer |
| JavaScript and TypeScript | the language, modules, async, Node, an HTTP server, Express, types, the DOM |
| Node.js backend | the event loop, files, streams, a solid REST API, authentication, structure and testing |
| PHP | arrays, functions, classes, requests and forms, JSON APIs, databases with PDO |
| React | components, props, state, lists, forms, effects, data, hooks, context |
| Next.js | app router, layouts, server and client components, routes, data, server actions |
| Game development | the game loop, input and movement, collisions, game state, a complete game |
| Docker | images, Dockerfiles, volumes, Compose, an app with a data store |
| Microservices | calls between services, a gateway, a queue and worker, resilience |
| DevOps | configuration, CI pipelines, releases and versions, deployments, observability |

## Quizzes, levels and a little fun

- Every lesson ends with a **quick quiz** in a pop-up. Each answer is marked at once, with an explanation.
- A **daily challenge** asks five questions, mostly from lessons you have done.
- Exercises, quizzes and reading earn **XP**. XP gives **levels**, learning on consecutive days builds a **streak**, and there are **badges** to collect.
- A **tour** shows a new learner around. The **?** button in the top bar starts it again.
- The home page has a **Resume where you left off** button that returns you to the lesson and the place on the page. Code you typed and did not run yet is kept as a draft.
- And there are jokes. Mostly bad ones.

Progress is kept in your browser, and, when the app is running, also in this folder, so it survives a change of browser.

## It uses your machine

The app never installs anything behind your back, and never sends your code anywhere.

- **A tool you already have is used as it is.** Setup shows its version and says there is nothing to do.
- **A language you do not have can run in Docker.** With Docker installed, the C, Java, Elixir, Go, Rust, Ruby, PHP and JavaScript exercises run in a container of the official image, so you can start a track without installing its toolchain.
- **Databases start on demand.** An exercise that needs PostgreSQL, MongoDB or Redis uses a server already on your machine, or starts a container such as `z2d-postgres`, reachable only from your computer.
- **Frameworks need one download.** React, Next.js and Express come from npm. Setup has a button for each package set; after that they work offline.
- **It knows where it runs.** On Ubuntu inside WSL it opens your Windows browser, and install instructions show the steps for your system first: Windows with WSL, Linux or macOS.

The first lesson of every track has an **Install** box: the quick way first (one command), then the steps by hand, and what your machine already has.

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
| your work on Git and shell exercises, npm package sets, build caches | `~/zero2dev-work/` | delete the folder |
| service containers and their data | Docker, named `z2d-postgres` and so on | `python3 check.py services down --purge` |
| Docker images | Docker | `docker rmi IMAGE` |
| tools installed by `setup/install.sh` | the system, or your home folder for mise and rustup | your package manager |
| progress, quiz results and chosen tracks | `.progress.json`, `.game.json`, `.profile.json` in this folder | delete the files |
| start at login | a user service, launch agent or Startup script | `python3 app.py autostart off` |

## Is the local server safe?

`app.py` runs your code, which is its purpose, so it is locked down: it listens on `127.0.0.1` only, refuses requests whose `Host` or `Origin` is not its own, and requires a token that only its own pages can read. Nobody else on your network can reach it. Do not put it behind a proxy that exposes it.

## Install the tools

You can install everything a track needs with one script, or let Docker stand in for what is missing.

**Windows** (from an Administrator PowerShell, inside the `setup` folder):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Stacks node,java,postgres -Docker
```

The first run installs WSL2 and Ubuntu and asks for a restart. Run it again afterwards to install the toolchains. Then work inside Ubuntu: the app opens in your Windows browser.

**Ubuntu, Debian, or inside WSL:**

```console
$ ./setup/install.sh                             # menu
$ ./setup/install.sh --stack node,java,postgres
$ ./setup/install.sh --all
$ ./setup/install.sh --list
```

Stacks: `core` (always: C toolchain, gdb, valgrind, git, GitHub CLI), `python`, `node`, `java`, `elixir`, `go`, `rust`, `ruby`, `php`, `postgres`, `sqlite`, `redis`, `mongodb`, `docker`. Details in [setup/README.md](setup/README.md).

**When something does not install**, the script says why in plain words and offers a way on: try again, install it another way (for example Rust from the Ubuntu packages when rustup cannot be downloaded), skip it, or stop. A summary at the end lists what works, what does not, and the exact command to try next. A missing language is never a dead end: the app can run it in Docker.

Linux, WSL and macOS are supported hosts for the app. Windows without WSL is not.

## Any language for algorithms

The data structures track is checked by input and output, so every exercise can be solved in C, C++, Python, Java, Elixir, JavaScript, TypeScript, Go, Rust, Ruby or PHP. In the app, pick the language above the editor. In a terminal:

```console
$ python3 check.py start dsa/01-max-of-list --lang java
$ python3 check.py dsa/01-max-of-list --lang java
```

## Layout

```text
app.py       the local web app (also: start, stop, status, autostart)
check.py     the terminal checker
z2d/         the engine: exercise runner, Docker fallback, services, server
catalog/     languages, services, npm package sets and install steps, as data
content/     lesson sources in Markdown, quizzes, tracks and paths
guide/       the lessons as static HTML, plus the app's pages
exercises/   one folder per exercise: task, starter files, tests
solutions/   reference solutions
setup/       install.sh (Linux, WSL) and install.ps1 (Windows)
tools/       build_guide.py, selftest.py, test_app.py
```

## Contributing

A new lesson, quiz, exercise, language, service, path or whole stack is data plus content: see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
