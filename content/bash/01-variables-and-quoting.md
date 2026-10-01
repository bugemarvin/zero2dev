---
title: Variables and quoting
summary: The rules that decide what your script really runs. Most Bash bugs come from getting these wrong.
---

## Where this track starts

[Shell scripts](start/06-shell-scripts) in the first track showed the basics. This track makes you fluent: scripts that take options, process text, survive odd input and fail safely.

Bash runs on your own machine. The app checks that it is installed and uses it as it is. Nothing needs downloading.

## Variables

```bash
name="Sam"
count=3
echo "$name has $count files"
```

- No spaces around `=`.
- `$name` reads the value. `${name}` is the same, and is needed when text follows directly: `"${name}_backup"`.
- Everything is text. `count=3` stores the characters `3`.

## What the shell does to a line

Before running a command, Bash rewrites the line in several steps. Two of them cause most surprises:

1. **Word splitting**: the result of an unquoted `$variable` is cut into separate words at spaces.
2. **Filename expansion**: unquoted `*` and `?` are replaced by matching file names.

```bash
file="my notes.txt"
rm $file          # runs: rm my notes.txt     two files!
rm "$file"        # runs: rm "my notes.txt"   one file
```

**Put double quotes around every variable.** There are very few cases where you want the splitting.

## The three kinds of quotes

| Written | Variables expanded | Use for |
| --- | --- | --- |
| `"double"` | yes | almost everything |
| `'single'` | no: every character is literal | text with `$` or backslashes |
| none | yes, then split and matched against file names | rarely |

```bash
price=5
echo "Cost: $price"      # Cost: 5
echo 'Cost: $price'      # Cost: $price
echo "Cost: \$$price"    # Cost: $5
```

## Command substitution

`$( ... )` runs a command and puts its output in place:

```bash
today="$(date +%F)"
lines="$(wc -l < notes.txt)"
echo "Today is $today and the file has $lines lines"
```

Quote it too. The output is subject to the same splitting.

## Arithmetic

`$(( ... ))` does whole-number arithmetic. Inside it, variables need no `$`.

```bash
total=$((count * 2 + 1))
count=$((count + 1))
```

There are no fractions: `$((7 / 2))` is `3`.

## Defaults and checks

Parameter expansion can supply a value when a variable is empty or unset:

| Form | Meaning |
| --- | --- |
| `${name:-default}` | the value, or `default` if empty or unset |
| `${name:=default}` | the same, and also assigns the default |
| `${name:?message}` | the value, or stop the script with the message |
| `${#name}` | the length of the value |

```bash
greeting="${1:-Hello}"
target="${2:?usage: greet.sh GREETING NAME}"
```

## Script arguments

| Variable | Holds |
| --- | --- |
| `$1`, `$2`, ... | the arguments |
| `$#` | how many there are |
| `"$@"` | all of them, each as its own word |
| `$0` | the name of the script |
| `$?` | the exit code of the last command |

Always write `"$@"` with the quotes. It is the only form that keeps arguments containing spaces intact:

```bash
for arg in "$@"; do
    echo "argument: $arg"
done
```

## printf

`echo` differs between systems when the text contains backslashes or starts with a dash. `printf` behaves the same everywhere and gives control over the format:

```bash
printf '%s is %d years old\n' "$name" "$age"
printf '%-10s|%5s|\n' "left" "right"
```

`%s` is text, `%d` a whole number, `%-10s` pads to 10 characters on the right, and `\n` is the newline you must add yourself.

## Common mistakes

- **Unquoted variables.** Names with spaces break the script, and an empty variable vanishes from the command.
- **Spaces around `=`.**
- **Single quotes when you wanted the variable expanded.**
- **`$*` or unquoted `$@`** in place of `"$@"`.
- **Backticks.** Wrapping a command in backtick characters is the old form of `$(date)`. It nests badly.
