---
title: Pipes and redirection
summary: Send output into files, and chain small commands together to answer real questions about data.
---

## Three streams

Every program starts with three channels already open:

| Stream | Short name | Normally connected to |
| --- | --- | --- |
| standard input | `stdin` | your keyboard |
| standard output | `stdout` | your screen |
| standard error | `stderr` | your screen |

Normal results go to `stdout`. Error messages go to `stderr`. They are separate so that you can save the results and still see the errors.

## Redirection

`>` sends standard output into a file instead of the screen:

```console
$ ls > files.txt
$ cat files.txt
a.txt
b.txt
files.txt
```

| Symbol | Effect |
| --- | --- |
| `> file` | write output to the file, **replacing** what was there |
| `>> file` | add output to the end of the file |
| `< file` | read input from the file instead of the keyboard |
| `2> file` | write error messages to the file |

> **Warning:** `>` empties the file first, without asking. Use `>>` when you mean to add.

## Pipes

A pipe, written `|`, connects the output of one command to the input of the next:

```console
$ ls | wc -l
3
```

`ls` produces the names, and `wc -l` counts the lines it receives. Neither command knows about the other. That is the central idea of the Unix terminal: **small tools, each doing one job, joined by pipes**.

## The tools you will pipe most

| Command | Job |
| --- | --- |
| `grep word` | keep only lines that contain `word` |
| `grep -v word` | keep only lines that do **not** |
| `grep -i word` | ignore upper and lower case |
| `sort` | sort lines (`-n` numerically, `-r` reversed) |
| `uniq` | drop repeated lines that are next to each other (`-c` counts them) |
| `wc -l` | count lines |
| `cut -d' ' -f2` | keep field 2, splitting each line on spaces |
| `head -n 3` | keep the first 3 lines |

## A worked example

Here is a small log file. Each line has a time, a level, and a user:

```text
10:01 INFO alice
10:02 ERROR bob
10:03 INFO alice
10:04 ERROR carol
10:05 ERROR bob
```

**Which lines are errors?**

```console
$ grep ERROR access.log
10:02 ERROR bob
10:04 ERROR carol
10:05 ERROR bob
```

**How many errors?**

```console
$ grep ERROR access.log | wc -l
3
```

**Which users appear, each one once?** Take the third field, sort it, then remove repeats. `uniq` only removes repeats that are neighbours, which is why `sort` comes first.

```console
$ cut -d' ' -f3 access.log | sort | uniq
alice
bob
carol
```

**Save an answer** by adding a redirect at the end:

```console
$ grep ERROR access.log > errors.txt
```

Build pipelines one step at a time. Run the first command and look at the output. Add `| next` and look again.

## Common mistakes

- **`sort | uniq` in the wrong order.** `uniq` before `sort` leaves duplicates behind.
- **Reading and writing the same file**, like `sort data.txt > data.txt`. The `>` empties the file before `sort` reads it, and you lose the data. Write to a new file.
- **`grep` is case-sensitive.** `grep error` does not match `ERROR` unless you add `-i`.
