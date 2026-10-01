---
title: Arrays and string operations
summary: Hold lists safely, and cut, replace and change text without calling another program.
---

## Arrays

A plain variable holds one string. An **array** holds a list, and keeps each element intact even when it contains spaces.

```bash
files=("report.txt" "my notes.txt" "todo.md")

echo "${files[0]}"          # report.txt
echo "${#files[@]}"         # 3: the number of elements
files+=("extra.txt")        # append

for f in "${files[@]}"; do
    echo "file: $f"
done
```

`"${files[@]}"`, with the quotes, expands to every element as a separate word. This is the reason arrays exist: it is the only reliable way to hold a list of file names or command arguments.

| Expression | Gives |
| --- | --- |
| `"${a[@]}"` | all elements |
| `"${a[0]}"` | one element |
| `"${#a[@]}"` | how many |
| `"${!a[@]}"` | the indexes |
| `"${a[@]:1:2}"` | two elements starting at index 1 |

Build a command in an array when its arguments vary:

```bash
args=(-l)
[[ "$show_hidden" == "yes" ]] && args+=(-a)
ls "${args[@]}"
```

Read lines of input into an array with `mapfile`:

```bash
mapfile -t lines < names.txt
echo "there are ${#lines[@]} names"
```

## Associative arrays

A dictionary from text keys to values. It must be declared:

```bash
declare -A age
age[ada]=36
age[linus]=54

echo "${age[ada]}"

for name in "${!age[@]}"; do
    echo "$name is ${age[$name]}"
done
```

The order of the keys is not defined. Sort the output if order matters.

## Parameter expansion

Bash can edit the value of a variable while expanding it. This is faster than starting `sed` or `cut`, and has no quoting problems.

**Removing from the ends:**

| Form | Removes | `path=/home/sam/photo.tar.gz` gives |
| --- | --- | --- |
| `${path##*/}` | longest match from the start | `photo.tar.gz` |
| `${path%/*}` | shortest match from the end | `/home/sam` |
| `${path%.*}` | shortest match from the end | `/home/sam/photo.tar` |
| `${path%%.*}` | longest match from the end | `/home/sam/photo` |
| `${path#*/}` | shortest match from the start | `home/sam/photo.tar.gz` |

A way to remember: on a keyboard `#` sits to the left of `$` and trims the left end. `%` sits to the right and trims the right end. Doubling the symbol makes it greedy.

**Replacing:**

```bash
name="my file name.txt"
echo "${name/ /_}"       # my_file name.txt   first match
echo "${name// /_}"      # my_file_name.txt   every match
echo "${name/%.txt/.md}" # my file name.md    only at the end
```

**Case, length, pieces:**

```bash
word="Hello"
echo "${word,,}"         # hello
echo "${word^^}"         # HELLO
echo "${#word}"          # 5
echo "${word:1:3}"       # ell   three characters from position 1
```

## A typical use

Change the extension of every `.jpeg` file to `.jpg`:

```bash
for file in *.jpeg; do
    [[ -e "$file" ]] || continue
    mv -- "$file" "${file%.jpeg}.jpg"
done
```

The `--` tells `mv` that what follows are file names, even if one starts with a dash.

## Splitting a string

Set `IFS` for a single `read`:

```bash
line="ada,36,London"
IFS=, read -r name age city <<< "$line"
```

`<<<` feeds a string to a command as its standard input. Into an array:

```bash
IFS=, read -r -a parts <<< "$line"
echo "${parts[2]}"       # London
```

## Common mistakes

- **`${files[@]}` without quotes.** Elements with spaces split apart.
- **`$files` alone.** That is only the first element.
- **Forgetting `declare -A`.** The array then uses numbers as indexes and every text key means element 0.
- **Mixing up `#` and `%`.** Try it on a sample in the terminal first.
- **`sh` in the shebang.** Arrays and these expansions are Bash features. Use `#!/usr/bin/env bash`.
