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
| `postgres` | PostgreSQL server and client, started, with a role and database named after your user | apt |
| `sqlite` | sqlite3 shell | apt |
| `redis` | Redis server and CLI, started | apt |
| `docker` | Docker Engine on native Linux. On WSL it tells you to use Docker Desktop | get.docker.com |

`core` is always installed. It also sets `init.defaultBranch main` for Git and, when run from a terminal, offers to set your Git name and email and create an SSH key.

[mise](https://mise.jdx.dev) manages the language runtimes. They are installed for your user, with no root needed, and its shims folder is added to `PATH` in `~/.bashrc` (and `~/.zshrc` if you have one). Open a new terminal after the install.

The JDK version can be changed: `Z2D_JAVA=temurin-21 ./install.sh --stack java`.

### Adding a stack

In `install.sh`, write two functions and register the name:

```bash
stack_php_install() { apt_install php-cli composer; }
stack_php_verify()  { have php || return 1; first_line php --version; }
```

Then add `php` to `STACKS` and a description to `STACK_DESC`. The verify function prints one line with the version, or returns non-zero when the tool is missing.

## `install.ps1`: Windows

Run from an **Administrator** PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
powershell -ExecutionPolicy Bypass -File .\install.ps1 -Stacks java,elixir,postgres
powershell -ExecutionPolicy Bypass -File .\install.ps1 -All -Docker
```

1. Installs Git, VS Code, Windows Terminal and PowerShell 7 with winget (`-Docker` adds Docker Desktop), plus the VS Code extensions for WSL, C/C++ and Python.
2. Enables WSL2 and installs Ubuntu. If WSL was not there before, it stops and asks you to restart, open Ubuntu once to create your Linux user, and run the script again.
3. Runs `install.sh` inside Ubuntu with the stacks you chose.

Other switches: `-Minimal`, `-Distro Ubuntu-24.04`, `-SkipApps`, `-SkipWsl`.
