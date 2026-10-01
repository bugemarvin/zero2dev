#!/usr/bin/env bash
# zero2dev installer: developer toolchains for Ubuntu / Debian / WSL.
# Safe to re-run: anything already installed is skipped.
#
#   ./install.sh                      pick stacks from a menu (default set if not a terminal)
#   ./install.sh --stack java,elixir  core + the named stacks
#   ./install.sh --all                everything
#   ./install.sh --minimal            core only
#   ./install.sh --list               show available stacks
#   ./install.sh --dry-run            print what would be done, change nothing
#   ./install.sh --yes                never ask questions
#
# Adding a stack: write stack_<name>_install and stack_<name>_verify,
# then add <name> to STACKS and STACK_DESC below.
set -euo pipefail

STACKS=(core python node java elixir go rust ruby php postgres sqlite redis mongodb docker)
DEFAULT_STACKS=(core python node)
declare -A STACK_DESC=(
  [core]="C toolchain, gdb, valgrind, make, cmake, git, GitHub CLI, shell tools"
  [python]="Python 3, pip, venv, pipx"
  [node]="Node.js LTS (via mise)"
  [java]="JDK (Temurin, via mise) and Maven"
  [elixir]="Erlang/OTP and Elixir (via mise), hex, rebar"
  [go]="Go (via mise)"
  [rust]="Rust (via rustup)"
  [ruby]="Ruby and bundler"
  [php]="PHP command line, common extensions (SQLite, mbstring, XML, curl) and Composer"
  [postgres]="PostgreSQL server and client, with a role and database for you"
  [sqlite]="SQLite command-line shell"
  [redis]="Redis server and CLI"
  [mongodb]="MongoDB server and the mongosh shell (from MongoDB's own package source)"
  [docker]="Docker Engine (on WSL: use Docker Desktop instead)"
)

JAVA_VERSION="${Z2D_JAVA:-temurin-25}"
MISE_SHIMS="$HOME/.local/share/mise/shims"

DRY=0
YES=0
NOSUDO=0
USER_STACKS=" node java go rust elixir "
SELECTED=()
PICKED=0

# ---------- output helpers ----------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RESET=$'\033[0m'
else
  BOLD=""; RED=""; GREEN=""; YELLOW=""; RESET=""
fi
info() { printf '%s==>%s %s\n' "$BOLD" "$RESET" "$*"; }
ok()   { printf '%s ok %s %s\n' "$GREEN" "$RESET" "$*"; }
warn() { printf '%swarn%s %s\n' "$YELLOW" "$RESET" "$*" >&2; }
die()  { printf '%serror%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

have() { command -v "$1" >/dev/null 2>&1; }
first_line() { "$@" 2>&1 | head -n 1; }

run() {
  if [ "$DRY" -eq 1 ]; then
    printf '    [dry-run] %s\n' "$*"
  else
    "$@"
  fi
}

as_root() {
  if [ "$(id -u)" -eq 0 ]; then run "$@"; else run sudo "$@"; fi
}

is_wsl() { grep -qi microsoft /proc/version 2>/dev/null; }
has_systemd() { [ -d /run/systemd/system ]; }
interactive() { [ "$YES" -eq 0 ] && [ "$DRY" -eq 0 ] && [ -t 0 ]; }

usage() {
  cat <<'USAGE'
zero2dev installer: developer toolchains for Ubuntu / Debian / WSL.

  install.sh                      pick stacks from a menu (default set if not a terminal)
  install.sh --stack java,elixir  core + the named stacks
  install.sh --all                everything
  install.sh --minimal            core only
  install.sh --list               show available stacks
  install.sh --dry-run            print what would be done, change nothing
  install.sh --yes                never ask questions
  install.sh --no-sudo --stack go  only stacks that install into your home folder (no password)
USAGE
}

list_stacks() {
  local s
  for s in "${STACKS[@]}"; do
    printf '  %-9s %s\n' "$s" "${STACK_DESC[$s]}"
  done
}

is_stack() {
  local s
  for s in "${STACKS[@]}"; do
    if [ "$s" = "$1" ]; then return 0; fi
  done
  return 1
}

select_stack() {
  local s
  for s in "${SELECTED[@]}"; do
    if [ "$s" = "$1" ]; then return 0; fi
  done
  SELECTED+=("$1")
}

# ---------- apt helpers ----------
apt_update() {
  as_root apt-get update -qq
}

pkg_installed() {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q "ok installed"
}

apt_install() {
  if [ "$NOSUDO" -eq 1 ]; then
    warn "skipped system packages (no administrator rights in this mode): $*"
    return 0
  fi
  local p want=() avail=()
  for p in "$@"; do
    if ! pkg_installed "$p"; then want+=("$p"); fi
  done
  if [ "${#want[@]}" -eq 0 ]; then return 0; fi
  if [ "$DRY" -eq 1 ]; then
    run apt-get install -y "${want[@]}"
    return 0
  fi
  for p in "${want[@]}"; do
    if apt-cache show "$p" >/dev/null 2>&1; then
      avail+=("$p")
    else
      warn "package not available on this distro, skipped: $p"
    fi
  done
  if [ "${#avail[@]}" -eq 0 ]; then return 0; fi
  as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y "${avail[@]}"
}

start_service() {
  # $1 = service name. Works with systemd and with plain WSL (no systemd).
  if has_systemd; then
    as_root systemctl enable --now "$1"
  else
    as_root service "$1" start
  fi
}

# ---------- shell rc + PATH ----------
add_rc_line() {
  # $1 = line to add to the user's shell startup files, once.
  local rc
  for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ "$rc" = "$HOME/.zshrc" ] && [ ! -f "$rc" ]; then continue; fi
    if [ -f "$rc" ] && grep -qF "$1" "$rc"; then continue; fi
    if [ "$DRY" -eq 1 ]; then
      printf '    [dry-run] add to %s: %s\n' "$rc" "$1"
    else
      printf '\n%s\n' "$1" >> "$rc"
    fi
  done
}

setup_paths() {
  export PATH="$HOME/.local/bin:$MISE_SHIMS:$HOME/.cargo/bin:$PATH"
}

ensure_mise() {
  setup_paths
  if have mise; then return 0; fi
  info "Installing mise (runtime version manager)"
  run sh -c 'curl -fsSL https://mise.run | sh'
  # Shims on PATH make the tools work in every shell, scripts included.
  add_rc_line "export PATH=\"\$HOME/.local/share/mise/shims:\$HOME/.local/bin:\$PATH\""
}

mise_use() {
  ensure_mise
  run mise use --global --yes "$@"
  run mise reshim
}

# ---------- stacks ----------
stack_core_install() {
  apt_install build-essential gcc g++ gdb valgrind make cmake clang clang-format \
    git curl wget ca-certificates gnupg unzip zip xz-utils openssh-client \
    jq ripgrep fzf tmux tree htop shellcheck man-db less nano
  install_gh
  configure_git
}

stack_core_verify() {
  local tool gh_version="gh missing"
  for tool in gcc make git gdb; do
    have "$tool" || return 1
  done
  if have gh; then gh_version="$(first_line gh --version)"; fi
  printf '%s; %s; %s' "$(first_line gcc --version)" "$(first_line git --version)" "$gh_version"
}

install_gh() {
  if have gh; then return 0; fi
  info "Adding the GitHub CLI apt repository"
  local key=/etc/apt/keyrings/githubcli-archive-keyring.gpg
  as_root mkdir -p -m 755 /etc/apt/keyrings
  run sh -c "curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg > /tmp/z2d-gh.gpg"
  as_root install -m 644 /tmp/z2d-gh.gpg "$key"
  local line
  line="deb [arch=$(dpkg --print-architecture) signed-by=$key] https://cli.github.com/packages stable main"
  run sh -c "echo '$line' > /tmp/z2d-gh.list"
  as_root install -m 644 /tmp/z2d-gh.list /etc/apt/sources.list.d/github-cli.list
  apt_update
  apt_install gh
}

configure_git() {
  have git || return 0
  if [ -z "$(git config --global init.defaultBranch || true)" ]; then
    run git config --global init.defaultBranch main
  fi
  if [ -z "$(git config --global pull.rebase || true)" ]; then
    run git config --global pull.rebase false
  fi
  if is_wsl && [ -z "$(git config --global core.autocrlf || true)" ]; then
    run git config --global core.autocrlf input
  fi
  if ! interactive; then return 0; fi

  local name email answer
  if [ -z "$(git config --global user.name || true)" ]; then
    read -r -p "Git user name (shown on your commits, Enter to skip): " name
    if [ -n "$name" ]; then git config --global user.name "$name"; fi
  fi
  if [ -z "$(git config --global user.email || true)" ]; then
    read -r -p "Git email (Enter to skip): " email
    if [ -n "$email" ]; then git config --global user.email "$email"; fi
  fi
  if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    read -r -p "Create an SSH key for GitHub now? [y/N] " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
      mkdir -p "$HOME/.ssh"
      chmod 700 "$HOME/.ssh"
      ssh-keygen -t ed25519 -C "$(git config --global user.email || echo "$USER")" -f "$HOME/.ssh/id_ed25519"
      printf '\nPublic key (add it with: gh auth login, or GitHub > Settings > SSH keys):\n'
      cat "$HOME/.ssh/id_ed25519.pub"
    fi
  fi
}

stack_python_install() {
  apt_install python3 python3-pip python3-venv python3-dev pipx
}
stack_python_verify() {
  have python3 || return 1
  first_line python3 --version
}

stack_node_install() {
  mise_use node@lts
}
stack_node_verify() {
  have node || return 1
  printf 'node %s' "$(first_line node --version)"
}

stack_java_install() {
  mise_use "java@$JAVA_VERSION" maven@latest
}
stack_java_verify() {
  have javac || return 1
  first_line javac -version
}

stack_elixir_install() {
  # Build dependencies, used only if mise has no prebuilt Erlang for this system.
  apt_install autoconf m4 libncurses-dev libssl-dev unzip
  mise_use erlang@latest
  mise_use elixir@latest
  run mix local.hex --force
  run mix local.rebar --force
}
stack_elixir_verify() {
  have elixir || return 1
  elixir --version 2>&1 | grep -m1 '^Elixir'
}

stack_go_install() {
  mise_use go@latest
}
stack_go_verify() {
  have go || return 1
  first_line go version
}

stack_rust_install() {
  setup_paths
  if have rustup; then
    run rustup update stable
  else
    run sh -c "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
  fi
}
stack_rust_verify() {
  have rustc || return 1
  first_line rustc --version
}

stack_ruby_install() {
  apt_install ruby-full
  if ! have bundle; then as_root gem install bundler --no-document; fi
}
stack_ruby_verify() {
  have ruby || return 1
  first_line ruby --version
}

stack_php_install() {
  apt_install php-cli php-sqlite3 php-mbstring php-xml php-curl composer
}
stack_php_verify() {
  have php || return 1
  first_line php --version | cut -d' ' -f1-2
}

as_postgres() {
  if [ "$(id -u)" -eq 0 ]; then run runuser -u postgres -- "$@"; else run sudo -u postgres "$@"; fi
}

stack_postgres_install() {
  apt_install postgresql postgresql-contrib
  start_service postgresql
  if [ "$DRY" -eq 1 ]; then
    run createuser --createdb "$(id -un)"
    run createdb "$(id -un)"
    return 0
  fi
  local i me
  me="$(id -un)"
  for i in $(seq 1 20); do
    if pg_isready -q; then break; fi
    sleep 1
    if [ "$i" -eq 20 ]; then die "PostgreSQL did not start"; fi
  done
  # A role and database named after you, so plain `psql` just works.
  if ! as_postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$me'" | grep -q 1; then
    as_postgres createuser --createdb "$me"
  fi
  if ! as_postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$me'" | grep -q 1; then
    as_postgres createdb -O "$me" "$me"
  fi
}
stack_postgres_verify() {
  have psql || return 1
  pg_isready -q || return 1
  first_line psql --version
}

stack_sqlite_install() {
  apt_install sqlite3
}
stack_sqlite_verify() {
  have sqlite3 || return 1
  printf 'sqlite %s' "$(sqlite3 --version | cut -d' ' -f1)"
}

stack_redis_install() {
  apt_install redis-server
  start_service redis-server
}
stack_redis_verify() {
  have redis-cli || return 1
  first_line redis-server --version | cut -d' ' -f1-3
}

MONGO_VERSION="${Z2D_MONGO:-8.0}"

stack_mongodb_install() {
  if ! have mongod || ! have mongosh; then
    # MongoDB is not in the Ubuntu or Debian archives: add the vendor's package source.
    local id codename repo key="/etc/apt/keyrings/mongodb-server-$MONGO_VERSION.gpg"
    id="$(. /etc/os-release && printf '%s' "${ID:-}")"
    codename="$(. /etc/os-release && printf '%s' "${VERSION_CODENAME:-}")"
    case "$id:$codename" in
      ubuntu:focal|ubuntu:jammy|ubuntu:noble)
        repo="deb [ signed-by=$key ] https://repo.mongodb.org/apt/ubuntu $codename/mongodb-org/$MONGO_VERSION multiverse" ;;
      debian:bookworm)
        repo="deb [ signed-by=$key ] https://repo.mongodb.org/apt/debian $codename/mongodb-org/$MONGO_VERSION main" ;;
      *)
        warn "MongoDB publishes no packages for $id $codename. Use Docker instead: python3 check.py services up mongodb"
        return 1 ;;
    esac
    apt_install gnupg curl
    info "Adding the MongoDB $MONGO_VERSION apt repository"
    as_root mkdir -p -m 755 /etc/apt/keyrings
    run sh -c "curl -fsSL https://www.mongodb.org/static/pgp/server-$MONGO_VERSION.asc | gpg --dearmor --yes -o /tmp/z2d-mongo.gpg"
    as_root install -m 644 /tmp/z2d-mongo.gpg "$key"
    run sh -c "echo '$repo' > /tmp/z2d-mongo.list"
    as_root install -m 644 /tmp/z2d-mongo.list "/etc/apt/sources.list.d/mongodb-org-$MONGO_VERSION.list"
    apt_update
    apt_install mongodb-org
  fi
  if has_systemd; then
    as_root systemctl enable --now mongod
  elif [ "$DRY" -eq 1 ] || ! pgrep -x mongod >/dev/null 2>&1; then
    # No systemd (plain WSL, containers): start the server directly, as the mongodb user.
    if [ "$(id -u)" -eq 0 ]; then
      run runuser -u mongodb -- mongod --config /etc/mongod.conf --fork
    else
      run sudo -u mongodb mongod --config /etc/mongod.conf --fork
    fi
  fi
}
stack_mongodb_verify() {
  have mongosh || return 1
  have mongod || return 1
  local i
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if mongosh --quiet --eval 'db.runCommand({ping: 1}).ok' >/dev/null 2>&1; then
      first_line mongod --version
      return 0
    fi
    sleep 1
  done
  return 1
}

stack_docker_install() {
  if have docker; then return 0; fi
  if is_wsl; then
    warn "On WSL use Docker Desktop for Windows (install.ps1 -Docker), then enable WSL integration in its settings."
    return 0
  fi
  run sh -c 'curl -fsSL https://get.docker.com | sh'
  if [ "$(id -u)" -ne 0 ]; then
    as_root usermod -aG docker "$(id -un)"
    warn "Log out and back in so your user can run docker without sudo."
  fi
}
stack_docker_verify() {
  have docker || return 1
  first_line docker --version
}

# ---------- menu ----------
pick_stacks() {
  local i=1 s answer token
  printf '%sWhich stacks do you want?%s (core is always installed)\n' "$BOLD" "$RESET"
  for s in "${STACKS[@]}"; do
    printf '  %2d) %-9s %s\n' "$i" "$s" "${STACK_DESC[$s]}"
    i=$((i + 1))
  done
  printf 'Numbers or names separated by spaces, "all", or Enter for the default (%s): ' "${DEFAULT_STACKS[*]}"
  read -r answer
  if [ -z "$answer" ]; then
    SELECTED=("${DEFAULT_STACKS[@]}")
    return 0
  fi
  if [ "$answer" = "all" ]; then
    SELECTED=("${STACKS[@]}")
    return 0
  fi
  for token in $answer; do
    if [[ "$token" =~ ^[0-9]+$ ]] && [ "$token" -ge 1 ] && [ "$token" -le "${#STACKS[@]}" ]; then
      select_stack "${STACKS[$((token - 1))]}"
    elif is_stack "$token"; then
      select_stack "$token"
    else
      warn "ignored: $token"
    fi
  done
}

# ---------- main ----------
while [ "$#" -gt 0 ]; do
  case "$1" in
    --stack|--stacks)
      [ "$#" -ge 2 ] || die "$1 needs a value, for example: $1 java,elixir"
      IFS=',' read -r -a requested <<< "$2"
      for s in "${requested[@]}"; do
        is_stack "$s" || die "unknown stack: $s (see --list)"
        select_stack "$s"
      done
      PICKED=1
      shift 2 ;;
    --all)      SELECTED=("${STACKS[@]}"); PICKED=1; shift ;;
    --minimal)  PICKED=1; shift ;;
    --list)     list_stacks; exit 0 ;;
    --dry-run)  DRY=1; shift ;;
    --yes|-y)   YES=1; shift ;;
    --no-sudo)  NOSUDO=1; YES=1; shift ;;
    -h|--help)  usage; exit 0 ;;
    *)          die "unknown option: $1 (see --help)" ;;
  esac
done

if [ "$NOSUDO" -eq 0 ]; then
  have apt-get || die "this script needs apt (Ubuntu, Debian or WSL Ubuntu)."
  if [ "$(id -u)" -ne 0 ] && ! have sudo; then die "sudo is required when not running as root."; fi
fi

if [ "$PICKED" -eq 0 ]; then
  if interactive; then pick_stacks; else SELECTED=("${DEFAULT_STACKS[@]}"); fi
fi

# core always runs, and runs first. In --no-sudo mode only home-folder stacks run.
if [ "$NOSUDO" -eq 1 ]; then
  ORDERED=()
  for s in "${SELECTED[@]}"; do
    case "$USER_STACKS" in
      *" $s "*) ORDERED+=("$s") ;;
      *) warn "stack '$s' needs administrator rights. Run in a terminal: ./setup/install.sh --stack $s" ;;
    esac
  done
  if [ "${#ORDERED[@]}" -eq 0 ]; then die "nothing to install without administrator rights."; fi
  have curl || die "curl is required. Install it with: sudo apt-get install curl"
else
  ORDERED=(core)
  for s in "${SELECTED[@]}"; do
    if [ "$s" != "core" ]; then ORDERED+=("$s"); fi
  done
fi

if is_wsl; then where="WSL"; else where="Linux"; fi
info "zero2dev installer on $where: ${ORDERED[*]}"
if [ "$DRY" -eq 1 ]; then info "dry run: nothing will be changed"; fi

if [ "$NOSUDO" -eq 0 ]; then
  apt_update
  # curl is needed by several stacks before core finishes on a bare system.
  apt_install curl ca-certificates
fi

FAILED=()
for s in "${ORDERED[@]}"; do
  info "Stack: $s"
  # A subshell with its own `set -e`, so one failing stack does not stop the rest.
  set +e
  ( set -e; "stack_${s}_install" )
  rc=$?
  set -e
  if [ "$rc" -ne 0 ]; then
    warn "stack '$s' failed (exit $rc), continuing"
    FAILED+=("$s")
  fi
done

setup_paths
hash -r
printf '\n%sSummary%s\n' "$BOLD" "$RESET"
for s in "${ORDERED[@]}"; do
  if version="$("stack_${s}_verify" 2>/dev/null)"; then
    printf '  %s✓%s %-9s %s\n' "$GREEN" "$RESET" "$s" "$version"
  elif [ "$DRY" -eq 1 ]; then
    printf '  - %-9s not installed yet\n' "$s"
  elif [ "$s" = "docker" ] && is_wsl; then
    printf '  - %-9s install Docker Desktop on Windows\n' "$s"
  else
    printf '  %s✗%s %-9s not working\n' "$RED" "$RESET" "$s"
    case " ${FAILED[*]-} " in
      *" $s "*) ;;
      *) FAILED+=("$s") ;;
    esac
  fi
done

if [ "$DRY" -eq 1 ]; then exit 0; fi
if [ "${#FAILED[@]}" -gt 0 ]; then
  die "finished with problems in: ${FAILED[*]}"
fi
printf '\nDone. Open a new terminal so PATH changes take effect.\n'
