---
title: Text processing
summary: grep, sed, awk and friends. Small tools that turn a file of text into the answer you need.
---

## The toolbox

| Tool | Job |
| --- | --- |
| `grep` | keep the lines that match a pattern |
| `cut` | keep certain columns |
| `sort` | sort lines |
| `uniq` | merge repeated neighbouring lines |
| `tr` | replace or delete characters |
| `sed` | edit text as it flows past |
| `awk` | compute with columns |
| `wc` | count lines, words, characters |

Each reads standard input and writes standard output, so they chain with pipes.

## grep

```bash
grep "ERROR" app.log            # lines containing ERROR
grep -i "error" app.log         # ignore case
grep -v "DEBUG" app.log         # lines that do NOT match
grep -c "ERROR" app.log         # count the matching lines
grep -n "ERROR" app.log         # show line numbers
grep -E "ERROR|FATAL" app.log   # extended patterns: this OR that
grep -o "[0-9]*ms" app.log      # print only the matching part
```

## Regular expressions in brief

| Pattern | Matches |
| --- | --- |
| `.` | any one character |
| `^` and `$` | start and end of the line |
| `[abc]`, `[0-9]` | one character from the set |
| `*` | the previous item, zero or more times |
| `+` | one or more times (with `grep -E`) |
| `?` | zero or one time (with `grep -E`) |
| `a\|b` | a or b (with `grep -E`) |

## cut, sort, uniq, tr

```bash
cut -d, -f2 staff.csv            # second column of a comma-separated file
sort names.txt                   # alphabetical
sort -n numbers.txt              # numerical
sort -t, -k3 -n -r staff.csv     # by the third comma-separated column, numbers, largest first
sort names.txt | uniq -c         # count how often each line occurs
tr 'a-z' 'A-Z' < file            # to upper case
tr -d '\r' < windows.txt         # delete carriage returns
tr -s ' ' < file                 # squeeze repeated spaces into one
```

`uniq` only merges lines that are next to each other, so sort first. The combination for "the most common values" is worth memorising:

```bash
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -n 5
```

## sed

`sed` applies an editing command to each line. The one you will use most is substitution:

```bash
sed 's/old/new/' file           # first match on each line
sed 's/old/new/g' file          # every match
sed -n '5,10p' file             # print only lines 5 to 10
sed '/^#/d' file                # delete lines that start with #
sed -E 's/([0-9]+)-([0-9]+)/\2-\1/' file    # swap two captured groups
```

`sed` writes the result to standard output and leaves the file alone. `sed -i` edits the file in place. Test without `-i` first.

## awk

`awk` splits every line into fields: `$1`, `$2` and so on, with `$0` the whole line and `NF` the number of fields. A program is a list of `condition { action }` pairs, run for every line.

```bash
awk '{ print $2 }' file                  # second field of every line
awk -F, '{ print $1, $3 }' staff.csv     # comma as the separator
awk -F, '$3 > 5000 { print $1 }' staff.csv        # only lines where field 3 is large
awk '{ total += $1 } END { print total }' numbers.txt
```

- `-F,` sets the field separator.
- `END { ... }` runs once after the last line. `BEGIN { ... }` runs before the first.
- Variables start at zero or empty with no declaration.

`awk` has dictionaries, which makes grouping a one-liner. Total salary per department:

```bash
awk -F, '{ total[$2] += $3 } END { for (d in total) print d, total[d] }' staff.csv | sort
```

The order of `for (d in total)` is not defined, which is why the result is piped through `sort`.

`printf` works as in the shell:

```bash
awk -F, '{ printf "%-10s %8.2f\n", $1, $3 }' staff.csv
```

## Choosing a tool

| Task | Reach for |
| --- | --- |
| find lines | `grep` |
| one column | `cut`, or `awk '{print $n}'` when the spacing is irregular |
| replace text | `sed` |
| arithmetic, grouping, conditions on columns | `awk` |
| the logic no longer fits on one line | a real language, such as Python |

## Common mistakes

- **`uniq` without `sort`.**
- **`cut` on columns separated by a varying number of spaces.** Use `awk`, which treats any run of spaces as one separator.
- **`sort` on numbers without `-n`.** Then 10 comes before 9.
- **`sed -i` on the only copy of a file.**
- **Double quotes around an awk program.** The shell then expands `$1` before awk sees it. Use single quotes.
