---
title: Tests and conditionals
summary: Decide with if, test files and strings with [[ ]], and choose between many cases.
---

## if runs a command

`if` does not evaluate an expression. It **runs a command** and looks at its exit code: 0 means true.

```bash
if grep -q "ERROR" app.log; then
    echo "there are errors"
fi
```

`grep -q` prints nothing and exits with 0 when it finds a match. Any command works there.

## [[ ]]

For comparisons, Bash provides `[[ ... ]]`. It is safer than the older `[ ... ]`: variables inside it are not split, and it supports patterns.

```bash
if [[ "$name" == "admin" ]]; then
    echo "welcome back"
elif [[ -z "$name" ]]; then
    echo "no name given"
else
    echo "hello, $name"
fi
```

The spaces after `[[` and before `]]` are required.

| Strings | True when |
| --- | --- |
| `[[ "$a" == "$b" ]]` | equal |
| `[[ "$a" != "$b" ]]` | different |
| `[[ -z "$a" ]]` | empty |
| `[[ -n "$a" ]]` | not empty |
| `[[ "$a" == *.txt ]]` | matches the pattern (leave the pattern unquoted) |
| `[[ "$a" =~ ^[0-9]+$ ]]` | matches the regular expression |

| Numbers | True when |
| --- | --- |
| `[[ "$a" -eq "$b" ]]` | equal |
| `-ne` `-lt` `-le` `-gt` `-ge` | not equal, less, less or equal, greater, greater or equal |

`==` compares **text**. `[[ 10 == 10.0 ]]` is false, and `[[ 9 < 10 ]]` compares alphabetically. For numbers use the `-eq` family, or arithmetic:

```bash
if (( count > 10 )); then
    echo "many"
fi
```

Inside `(( ))` you write ordinary operators and need no `$`.

| Files | True when |
| --- | --- |
| `[[ -e path ]]` | it exists |
| `[[ -f path ]]` | it is a regular file |
| `[[ -d path ]]` | it is a directory |
| `[[ -r path ]]`, `-w`, `-x` | it is readable, writable, executable |
| `[[ -s path ]]` | it exists and is not empty |

## Combining

```bash
if [[ -f "$file" && -r "$file" ]]; then ...
if [[ "$answer" == "y" || "$answer" == "yes" ]]; then ...
if [[ ! -d "$dir" ]]; then ...
```

## Short circuits

`&&` runs the next command only if the previous one succeeded. `||` runs it only if the previous one failed.

```bash
mkdir -p "$dir" && cd "$dir"
[[ -f "$config" ]] || { echo "missing $config" >&2; exit 1; }
```

The second line is the standard way to stop early on a missing requirement.

## case

When one value is compared against many possibilities, `case` is clearer than a chain of `elif`. It matches **patterns**:

```bash
case "$1" in
    start)
        echo "starting"
        ;;
    stop|halt)
        echo "stopping"
        ;;
    *.txt)
        echo "a text file"
        ;;
    *)
        echo "unknown: $1" >&2
        exit 1
        ;;
esac
```

Each branch ends with `;;`. `|` separates alternatives, and `*)` at the end catches everything else.

## Exit codes

A script ends with the exit code of its last command, or the one given to `exit`. By convention:

| Code | Meaning |
| --- | --- |
| 0 | success |
| 1 | general failure |
| 2 | wrong usage: bad arguments |

Send error messages to standard error with `>&2`, so they do not mix with the real output.

## Common mistakes

- **`[[ $a = $b ]]` for numbers.** It compares text.
- **Missing spaces**: `[["$a" == "b"]]` is an error.
- **A quoted pattern.** `[[ "$f" == "*.txt" ]]` compares with the literal text `*.txt`.
- **`if [ $x = y ]` with `x` empty** in the old single-bracket form, which becomes `[ = y ]` and fails. Use `[[ ]]`.
- **Forgetting `;;`** in a `case`.
