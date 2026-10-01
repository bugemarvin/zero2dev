# zero2dev

Learn to program on your own computer, from the first terminal command to shipping services. Read a lesson, take a quick quiz, write the code in the browser or in your own editor, and run tests that tell you at once whether it works.

**Read it online:** https://zero2dev-olive.vercel.app (lessons and quizzes; the **Install** button there puts the app on your computer, where the exercises run).

Two things live in this repository:

- **the learning app**: 202 lessons, 697 quiz questions and 210 exercises in 26 tracks, with a checker that runs your code using the tools on your machine;
- **`setup/`**: a quick installer for a developer machine (Windows with WSL2, Ubuntu, Debian), where you pick the stacks you want.

## Never done this before?

You need a computer and nothing else. No maths, no "tech background".

1. **Get Python 3.** On Windows, run the installer in `setup/` (see [Install the tools](#install-the-tools)): it sets up Ubuntu inside Windows, with Python. On macOS and Linux it is usually there already: `python3 --version` tells you.
2. **Get this project**: `git clone https://github.com/bugemarvin/zero2dev.git`, or download it as a ZIP from GitHub and unpack it.
3. **Start the app**: in a terminal, go into the `zero2dev` folder and type `python3 app.py`. It opens in your browser.
4. On the home page choose the path **Start from zero** and press **Start**. A one-minute tour shows you around, and the first lesson explains every word as it comes.

## Start

One line installs it and starts it. Run it again later to update.

**Ubuntu, Debian, macOS, or Ubuntu inside WSL:**

```console
$ curl -fsSL https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/get.sh | bash
```

**Windows** (PowerShell, run as Administrator; it sets up Ubuntu inside Windows first):

```powershell
irm https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/get.ps1 | iex
```

Or by hand:

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

The first time you run `python3 app.py`, the app sets itself up to **start when you log in**, and tells you so. From then on it is always at the same address, one bookmark away, with nothing to remember.

```console
$ python3 app.py status
$ python3 app.py stop            # stop it now
$ python3 app.py start           # run it in the background again
$ python3 app.py autostart off   # do not start at login any more (on, status)
```

Not what you want? `python3 app.py autostart off` switches it off for good: it is never switched on again by itself. `python3 app.py --no-autostart` starts the app once without touching this, and so does setting `Z2D_AUTOSTART=0`.

`autostart` uses what the system offers and needs no administrator rights: a systemd user service on Linux, a launch agent on macOS, and on Windows a small script in the Startup folder that runs the app inside WSL. The same switch is on the Setup page. `--port 5000` picks another port.

## The guide online, the work on your machine

The `guide/` folder is a plain static site, so it can be put online, for example on Vercel. Online it is the front door: every lesson and quiz can be read there, and an **Install on this computer** button opens a pop-up with the steps for the visitor's system (PowerShell on Windows, a terminal on Linux or macOS). After those steps the app is on their machine, works offline and starts at login. The online copy never runs anyone's code.

**Deploying on Vercel:** import this repository in Vercel and deploy. `vercel.json` already says that the site is the `guide/` folder and that there is nothing to build. Each push to `main` then updates the site.

The install line shown on the online site names that site (`Z2D_TRUST=https://...`). Running the line is your consent: the app on your computer then accepts that site, and after **I ran it: check** the online pages work with your machine directly. You can run exercises there, see what your computer is installing, and use its terminal, without leaving the site. Leave the `Z2D_TRUST` part out if you only want the offline app.

Be clear about what that consent means: **a site you allow can run commands on your computer**, exactly as the app's own pages can. Allow only a site you trust. Without the `Z2D_TRUST` part nothing is allowed, and the online pages offer two things instead:

- **Open my app**: go to `http://127.0.0.1:4750`, the copy on your own machine.
- **Use it on this page**: your browser opens a page **of your own app**, which names the website and asks you to allow it.

You can remove a site at any time on the Setup page, or with:

```console
$ python3 app.py trusted
$ python3 app.py untrust https://your-site.vercel.app
```

Chrome and Edge ask whether the site may reach apps on your device: that is this connection, and without your "Allow" the site cannot even see that the app is there. Safari does not allow it at all. In both cases nothing is lost: use **Open my app**, or go to `http://127.0.0.1:4750` yourself.

## A terminal in the page, and what the machine is doing

With the app running, the **>_ Terminal** button in the top bar opens a drawer with two tabs.

- **Terminal** is a real shell on your computer, in the project folder. The **Install** buttons on the Setup page run the install script there, so you watch every step, and when it asks for your password or offers a choice (try again, install another way, skip), you answer in the page. A password prompt hides what you type. Ctrl+C stops a command.
- **Activity** shows what the machine is doing for the app: downloads in progress with their output, exercise apps and previews that are running, and databases running in Docker.

It is a simple display, not a full terminal emulator: programs that paint the whole screen, such as `vim` or `top`, need a real terminal.

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
| Vue | single-file components, reactivity, props and events, lists, forms with v-model, composables |
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

The app never installs tools behind your back, and never sends your code anywhere. The one thing it sets up by itself is starting at login, which it announces and which one command undoes (see above).

- **A tool you already have is used as it is.** Setup shows its version and says there is nothing to do.
- **A language you do not have can run in Docker.** With Docker installed, the C, Java, Elixir, Go, Rust, Ruby, PHP and JavaScript exercises run in a container of the official image, so you can start a track without installing its toolchain.
- **Databases start on demand.** An exercise that needs PostgreSQL, MongoDB or Redis uses a server already on your machine, or starts a container such as `z2d-postgres`, reachable only from your computer.
- **Frameworks need one download.** React, Vue, Next.js and Express come from npm. Setup has a button for each package set; after that they work offline.
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

`app.py` runs your code, which is its purpose, so it is locked down: it listens on `127.0.0.1` only, refuses requests whose `Host` is not its own, refuses requests from other websites, and requires a token that only its own pages can read. Nobody else on your network can reach it. Do not put it behind a proxy that exposes it.

The one exception is a website you have approved yourself (see above). It may call the API from its own address, with the token, and that includes the terminal: an approved site can run commands on your computer. It cannot approve other sites, and you can remove it at any time. Any website may ask one question, "is the app here?", and gets a yes with nothing else.

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
setup/       get.sh and get.ps1 (one-line install of the app), install.sh and install.ps1 (developer tools)
vercel.json  puts guide/ online as a static site
tools/       build_guide.py, selftest.py, test_app.py
```

## Open source

zero2dev is free and open source under the [MIT licence](LICENSE): you may use it, copy it, change it and share it, also commercially, as long as the licence text stays with it. It comes with no warranty.

**Contributions are welcome**, from a fixed typo to a whole new stack. A new lesson, quiz, exercise, language, service or path is data plus content, and needs no change to the engine.

The short version of the rules:

- What you contribute is under the MIT licence too, and must be your own work or work you are allowed to reuse, with its source named.
- Work on a branch and send a pull request into `development`. Nobody pushes to `main`, `master` or `development` directly: those branches accept only reviewed pull requests with green checks.
- Keep pull requests small, and open an issue before starting something big such as a new stack.
- Every exercise comes with a reference solution, and its starter must fail the tests. Every lesson comes with a quiz.
- Write for a beginner whose first language may not be English.
- The app stays offline-first: no trackers, no accounts, nothing loaded from other sites.
- The security of the local server is never weakened.

| File | What it covers |
| --- | --- |
| [CONTRIBUTING.md](CONTRIBUTING.md) | the rules in full, how to send a change, and how lessons, quizzes, exercises and stacks are written |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | how we treat each other |
| [SECURITY.md](SECURITY.md) | what the app promises, and how to report a vulnerability privately |
| [LICENSE](LICENSE) | the MIT licence |

To propose a stack, report a broken exercise or point out an unclear lesson, open an issue: there is a form for each.
