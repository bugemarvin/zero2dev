---
title: Loops
summary: Repeat over arguments, files, numbers and lines of input, without the classic traps.
---

## for over a list

```bash
for fruit in apple banana cherry; do
    echo "I like $fruit"
done
```

Over the script's arguments:

```bash
for arg in "$@"; do
    echo "got: $arg"
done
```

Over files. Let the shell expand the pattern. Never loop over the output of `ls`, which breaks on names with spaces:

```bash
for file in *.txt; do
    [[ -e "$file" ]] || continue      # the pattern matched nothing
    echo "processing $file"
done
```

If no file matches, the pattern stays as the literal text `*.txt`. The test on the first line of the body skips that case.

## Counting

```bash
for i in {1..5}; do
    echo "$i"
done

for (( i = 0; i < 5; i++ )); do
    echo "$i"
done
```

`{1..5}` cannot contain variables. For a range that depends on a variable use the second form, or `seq`: `for i in $(seq 1 "$n")`.

## while

Runs as long as a command succeeds:

```bash
count=3
while (( count > 0 )); do
    echo "$count"
    count=$((count - 1))
done
```

`until` is the opposite: it runs until the command succeeds.

## Reading lines

The correct way to process input line by line:

```bash
while IFS= read -r line; do
    echo "line: $line"
done < input.txt
```

- `read -r` keeps backslashes as they are.
- `IFS=` keeps leading and trailing spaces.
- The file is redirected into the **loop**, after `done`.

Without `< file` the loop reads standard input, so the script works in a pipeline.

`read` can split a line into several variables:

```bash
while read -r name score; do
    echo "$name scored $score"
done < scores.txt
```

With another separator, set `IFS` for that one command:

```bash
while IFS=, read -r name dept salary; do
    echo "$name works in $dept"
done < staff.csv
```

## The pipe trap

Each part of a pipeline runs in its own subshell. A variable changed inside a piped loop is lost when the loop ends:

```bash
total=0
cat numbers.txt | while read -r n; do
    total=$((total + n))
done
echo "$total"          # prints 0
```

Redirect the file into the loop instead, and the loop runs in the main shell:

```bash
total=0
while read -r n; do
    total=$((total + n))
done < numbers.txt
echo "$total"          # correct
```

## break and continue

`break` leaves the loop. `continue` jumps to the next round.

```bash
for file in *.log; do
    [[ -s "$file" ]] || continue        # skip empty files
    if grep -q "FATAL" "$file"; then
        echo "first fatal error is in $file"
        break
    fi
done
```

## Finding the smallest and largest

A pattern that comes up constantly: keep the best value so far, starting with the first.

```bash
min="$1"
max="$1"
for n in "$@"; do
    (( n < min )) && min="$n"
    (( n > max )) && max="$n"
done
```

Starting from the first value, and not from 0, makes it correct for negative numbers.

## Common mistakes

- **`for f in $(ls)`.** Use the pattern directly: `for f in *`.
- **Piping into `while`** and expecting variables to survive.
- **`read` without `-r`.**
- **A variable inside `{1..$n}`.** It does not expand.
- **A missing last line.** `read` fails on a final line that has no newline. Add `|| [[ -n "$line" ]]` to the condition if the input may lack one.
