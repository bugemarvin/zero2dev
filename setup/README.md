# Setup scripts

## `install.sh`: Ubuntu, Debian, WSL

```console
$ ./install.sh                 # choose from a menu (default set when not run from a terminal)
$ ./install.sh --stack java,elixir,postgres
$ ./install.sh --all
$ ./install.sh --minimal       # core only
$ ./install.sh --list
$ ./install.sh --dry-run --all # show what would happen, change nothing
$ ./install.sh --yes           # never ask questions
$ ./install.sh --no-sudo --stack go   # only stacks that install into your home folder: no password
```

It is safe to run again. Installed packages are skipped, and a summary of versions is printed at the end. If one stack fails, the others still run and the script exits with an error at the end.

| Stack | Installs | How |
| --- | --- | --- |
| `core` | gcc, g++, gdb, valgrind, make, cmake, clang, git, GitHub CLI, curl, jq, ripgrep, fzf, tmux, shellcheck | apt |
| `python` | python3, pip, venv, pipx | apt |
| `node` | Node.js LTS | mise |
| `java` | Temurin JDK and Maven | mise |
| `elixir` | Erlang/OTP, Elixir, hex, rebar | mise |
| `go` | Go | mise |
| `rust` | Rust stable | rustup |
| `ruby` | Ruby, bundler | apt |
| `php` | PHP command line, SQLite, mbstring, XML and curl extensions, Composer | apt |
| `postgres` | PostgreSQL server and client, started, with a role and database named after your user | apt |
| `sqlite` | sqlite3 shell | apt |
| `redis` | Redis server and CLI, started | apt |
| `mongodb` | MongoDB server and `mongosh`, started. Ubuntu 20.04 to 24.04 and Debian 12; elsewhere use Docker | MongoDB's apt repository |
| `docker` | Docker Engine on native Linux. On WSL it tells you to use Docker Desktop | get.docker.com |

`core` is always installed. It also sets `init.defaultBranch main` for Git and, when run from a terminal, offers to set your Git name and email and create an SSH key.

[mise](https://mise.jdx.dev) manages the language runtimes. They are installed for your user, with no root needed, and its shims folder is added to `PATH` in `~/.bashrc` (and `~/.zshrc` if you have one). Open a new terminal after the install.

The JDK version can be changed: `Z2D_JAVA=temurin-21 ./install.sh --stack java`.

### When a stack does not install

The script does not just carry on. For the stack that failed it:

1. says **why**, in one line (the download failed, a package is missing on this version of Ubuntu, the disk is full, ...);
2. offers a way on, or takes it by itself when nobody is there to ask:

```text
What now for rust?
  r) try again
  a) install it another way: Rust (rustc and cargo) from the Ubuntu packages
  s) skip it (the app can run Rust in Docker instead)
  q) stop the installer
```

| Option | Does |
| --- | --- |
| `--on-fail ask` | asks, as above. The default in a terminal. |
| `--on-fail auto` | tries again once, then installs another way, then skips. The default when there is no terminal. |
| `--on-fail skip` | notes the problem and goes on |
| `--fallback` | uses the other way straight away: `./install.sh --stack rust --fallback` |

`node`, `java`, `elixir`, `go` and `rust` have another way: the Ubuntu packages, which are older and enough for the lessons.

The summary lists each stack as working or not, with the reason, the log file and the command to try next. A step that a stack can live without, such as Hex for Elixir, is reported as a **note** and does not count as a failure. The script exits with an error only when a stack is really not usable at the end.

The learning app uses the same script. On its Setup page, and in the Install box of a track's first lesson, a missing language that installs into the home folder (`node`, `java`, `go`, `rust`, `elixir`) gets an **Install** button, which runs `install.sh --no-sudo --stack NAME`. Stacks that need administrator rights show the command to paste into a terminal, because a web page must not ask for your password. When an install fails there, the log stays on screen with buttons to try again or to install another way.

### Adding a stack

In `install.sh`, write two functions and register the name:

```bash
stack_lua_install() { apt_install lua5.4; }
stack_lua_verify()  { have lua5.4 || return 1; first_line lua5.4 -v; }
```

Then add `lua` to `STACKS` and a description to `STACK_DESC`. The verify function prints one line with the version, or returns non-zero when the tool is missing. An optional `stack_lua_fallback` function is the other way of installing, and `soft "what it is" command...` runs a step that the stack can live without.

## `install.ps1`: Windows

Run from an **Administrator** PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Stacks java,elixir,postgres
powershell -ExecutionPolicy Bypass -File .\install.ps1 -All -Docker
```

1. Installs Git, VS Code, Windows Terminal and PowerShell 7 with winget (`-Docker` adds Docker Desktop), plus the VS Code extensions for WSL, C/C++ and Python.
2. Enables WSL2 and installs Ubuntu. If WSL was not there before, it stops and asks you to restart, open Ubuntu once to create your Linux user, and run the script again.
3. Runs `install.sh` inside Ubuntu with the stacks you chose. If a stack does not install, you are asked what to do (see above).
4. Prints how to start the app. It runs inside Ubuntu and opens in your Windows browser.

Other switches: `-Minimal`, `-Distro Ubuntu-24.04`, `-SkipApps`, `-SkipWsl`.
