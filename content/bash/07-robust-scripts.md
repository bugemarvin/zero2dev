---
title: Robust scripts
summary: Options, strict mode, clean-up on exit, and the checker that finds bugs before you run anything.
---

## Strict mode

By default Bash carries on after a failed command and treats a misspelled variable as empty. In a script that deletes or overwrites things, both are dangerous. Start scripts with:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

| Setting | Effect |
| --- | --- |
| `-e` | stop when a command fails |
| `-u` | using an unset variable is an error |
| `-o pipefail` | a pipeline fails if any command in it fails, not only the last |

With `-u`, reading `$1` when no argument was given stops the script. Use `${1:-}` where a missing value is acceptable.

With `-e`, a command that is allowed to fail needs to say so:

```bash
grep -q "pattern" file || true
if ! cp "$src" "$dst"; then
    echo "copy failed" >&2
fi
```

A command tested by `if`, `while`, `&&` or `||` does not trigger `-e`.

## Options with getopts

`getopts` parses short options such as `-v` and `-d DIR`:

```bash
verbose=0
outdir="backup"

while getopts "vd:h" option; do
    case "$option" in
        v) verbose=1 ;;
        d) outdir="$OPTARG" ;;
        h) usage; exit 0 ;;
        *) usage >&2; exit 2 ;;
    esac
done
shift $((OPTIND - 1))

# "$@" now holds only the remaining arguments
```

- In the string `"vd:h"`, a colon after a letter means that option takes a value, delivered in `OPTARG`.
- An unknown option lands in the `*)` branch.
- `shift $((OPTIND - 1))` removes the options that were parsed.

## A usage function

```bash
usage() {
    cat <<END
usage: backup.sh [-v] [-d DIR] FILE...
  -v       print each file as it is copied
  -d DIR   where to put the copies (default: backup)
END
}
```

`<<END ... END` is a **here-document**: the lines up to the end marker become the standard input of the command. The marker can be any word.

## Cleaning up with trap

`trap` runs a command when the script exits, however it exits: normally, through an error, or because the user pressed Ctrl+C.

```bash
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

# ... use "$workdir" freely; it is removed whatever happens
```

`mktemp` creates a temporary file with a unique name, and `mktemp -d` a directory. Never invent names like `/tmp/myscript.tmp` yourself: two runs at once would collide.

## Validate first

Check everything you can before changing anything:

```bash
if [[ $# -eq 0 ]]; then
    usage >&2
    exit 2
fi

for file in "$@"; do
    if [[ ! -f "$file" ]]; then
        echo "error: $file not found" >&2
        exit 1
    fi
done
```

Then do the work. A script that fails half-way leaves a mess that is harder to fix than a script that refuses to start.

## Safe file handling

```bash
cp -- "$file" "$outdir/"         # -- ends the options: a file named -rf is harmless
mkdir -p "$outdir"               # no error if it exists
rm -rf "${dir:?}/"*              # refuses to run if dir is empty, instead of deleting /*
```

## ShellCheck

`shellcheck` reads a script and reports real bugs: unquoted variables, wrong tests, unreachable code.

```console
$ shellcheck backup.sh
In backup.sh line 12:
cp $file $outdir
   ^---^ SC2086: Double quote to prevent globbing and word splitting.
```

It is installed by the `core` stack of the setup script. Run it on every script you write. It teaches Bash better than any guide.

## Debugging

```bash
bash -x script.sh        # print each command before it runs
set -x                   # the same, switched on inside the script
```

## Common mistakes

- **No `set -euo pipefail`**, so the script continues after a failure.
- **Parsing options by hand** with a pile of `if` statements.
- **Temporary files that are never removed.**
- **`cd "$dir"` with no check.** If it fails, the next commands run in the wrong folder. Under `set -e` it stops the script, which is what you want.
- **Ignoring ShellCheck warnings.**
