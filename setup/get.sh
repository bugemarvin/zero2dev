#!/usr/bin/env bash
# zero2dev: get the learning app onto this computer and start it.
#
#   curl -fsSL https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/get.sh | bash
#
# Works on Ubuntu, Debian, Ubuntu inside WSL, and macOS. It needs only git and Python 3,
# and installs those two if they are missing (asking for your password on Linux).
# After this the app runs offline, at http://127.0.0.1:4750, and starts when you log in.
# Run it again at any time to update.
#
#   Z2D_DIR=/some/folder    where to put it (default: ~/zero2dev)
#   Z2D_NO_START=1          download only, do not start the app
set -euo pipefail

REPO="https://github.com/bugemarvin/zero2dev.git"
DIR="${Z2D_DIR:-$HOME/zero2dev}"

say()  { printf '\n==> %s\n' "$*"; }
fail() { printf '\nerror: %s\n' "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

as_root() {
  if [ "$(id -u)" -eq 0 ]; then "$@"
  elif have sudo; then sudo "$@"
  else fail "this needs administrator rights and sudo is not installed. Install git and python3 yourself, then run this again."
  fi
}

need_tools() {
  local missing=()
  have git || missing+=(git)
  have python3 || missing+=(python3)
  if [ "${#missing[@]}" -eq 0 ]; then return 0; fi
  say "Installing: ${missing[*]}"
  if have apt-get; then
    as_root apt-get update -qq
    as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y "${missing[@]}" ca-certificates
  elif have dnf; then
    as_root dnf install -y "${missing[@]}"
  elif have pacman; then
    local packages=()
    for m in "${missing[@]}"; do if [ "$m" = python3 ]; then packages+=(python); else packages+=("$m"); fi; done
    as_root pacman -S --noconfirm "${packages[@]}"
  elif have brew; then
    for m in "${missing[@]}"; do if [ "$m" = python3 ]; then brew install python; else brew install "$m"; fi; done
  elif [ "$(uname -s)" = Darwin ]; then
    fail "git and python3 come with Apple's command line tools. Run:  xcode-select --install   then run this again."
  else
    fail "please install ${missing[*]} with your package manager, then run this again."
  fi
}

need_tools

if [ -d "$DIR/.git" ]; then
  say "Updating zero2dev in $DIR"
  git -C "$DIR" pull --ff-only || printf 'Could not update (local changes?). Carrying on with the copy you have.\n'
elif [ -e "$DIR" ]; then
  fail "$DIR exists and is not a copy of zero2dev. Move it away, or choose another place: Z2D_DIR=~/somewhere"
else
  say "Downloading zero2dev into $DIR"
  git clone --depth 1 "$REPO" "$DIR"
fi

if [ "${Z2D_NO_START:-0}" = 1 ]; then
  printf '\nDone. Start it with:  cd %s && python3 app.py\n' "$DIR"
  exit 0
fi

say "Starting the app"
cd "$DIR"
python3 app.py start
cat <<DONE

zero2dev is installed in $DIR and works without the internet from now on.
  Open it:      http://127.0.0.1:4750
  Tools:        the Setup page shows what this computer has and installs what is missing
  Update:       run this command again
  Remove:       python3 app.py autostart off; python3 app.py stop; then delete $DIR and ~/zero2dev-work
DONE
