# zero2dev

Two things in one repository:

- **`setup/`**: a quick installer for a developer machine. Windows with WSL2, Ubuntu, or Debian. Pick the stacks you want.
- **`guide/`**: an offline course from zero to advanced, with tests you run in your own terminal.

## Learn

1. Get the project: clone it, or use **Code > Download ZIP** on GitHub and unzip it.
2. Install the tools (see below).
3. Open `guide/index.html` in your browser. No internet or server is needed.
4. Follow a lesson, do its exercise, and check your work:

```console
$ python3 check.py next          # what to do next
$ python3 check.py c/01-hello    # run the tests for one exercise
$ python3 check.py progress      # how far you are
```

Your results show up on the guide's home page.

> **Status:** the tracks are being written in order. Available now: Start here, Git, C, Python.

| Track | What you learn |
| --- | --- |
| Start here | how programs run, the terminal, files, pipes, shell scripts |
| Git | commits, branches, merging, conflicts, remotes, undoing, rebase, pull requests |
| C | compiling, pointers, memory, structs, files, Makefiles, debugging |
| Python | the language from basics to classes, generators, testing and typing |
| Data structures and algorithms | from Big-O to graphs, dynamic programming and segment trees, in any language |
| SQL and PostgreSQL | queries, joins, schema design, indexes, transactions |
| Java | the language, classes, collections, generics |
| Elixir | pattern matching, recursion, processes, GenServer |

The data structures track is checked by input and output, so you can solve it in C, C++, Python, Java, Elixir, JavaScript, Go, Rust or Ruby:

```console
$ python3 check.py start dsa/01-max-of-list --lang java
$ python3 check.py dsa/01-max-of-list --lang java
```

## Install the tools

**Windows** (from an Administrator PowerShell, inside the `setup` folder):

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Stacks java,postgres
```

The first run installs WSL2 and Ubuntu and asks for a restart. Run it again afterwards to install the toolchains.

**Ubuntu, Debian, or inside WSL:**

```console
$ ./setup/install.sh                           # menu
$ ./setup/install.sh --stack java,elixir,postgres
$ ./setup/install.sh --all
$ ./setup/install.sh --list
```

Without cloning first:

```console
$ curl -fsSL https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/install.sh | bash -s -- --stack java,postgres
```

Stacks: `core` (always: C toolchain, gdb, valgrind, git, GitHub CLI), `python`, `node`, `java`, `elixir`, `go`, `rust`, `ruby`, `postgres`, `sqlite`, `redis`, `docker`. Details in [setup/README.md](setup/README.md).

## Layout

```text
setup/       install.sh (Linux, WSL) and install.ps1 (Windows)
guide/       the course as static HTML: open index.html
content/     lesson sources in Markdown
exercises/   one folder per exercise: task, starter files, tests
solutions/   reference solutions
check.py     the test runner (Python standard library only)
tools/       build_guide.py and selftest.py
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a lesson, an exercise, a language, or an installer stack.

## License

MIT
