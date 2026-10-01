---
title: Files and paths
summary: How to name any file on the machine, read it, match many files at once, and make a script runnable.
---

## Paths

A **path** is the address of a file or folder. There are two kinds.

An **absolute path** starts at the top of the system, written `/`, and works from anywhere:

```text
/home/sam/zero2dev/check.py
```

A **relative path** starts from the folder you are in. If you are in `/home/sam`, the same file is:

```text
zero2dev/check.py
```

Four short names are worth learning by heart:

| Name | Meaning |
| --- | --- |
| `.` | the current folder |
| `..` | the folder above this one |
| `~` | your home folder |
| `/` | the top of the whole system |

```console
$ cd ~/zero2dev/exercises
$ ls ..
check.py  content  exercises  guide  setup
$ cd ../guide
```

## Reading files

| Command | Use it for |
| --- | --- |
| `cat file` | print a short file |
| `less file` | scroll through a long file (`q` quits) |
| `head -n 5 file` | the first 5 lines |
| `tail -n 5 file` | the last 5 lines |
| `wc -l file` | count the lines |

## Wildcards

The shell can fill in file names for you. A `*` matches any run of characters:

```console
$ ls
a.txt  b.txt  notes.md  photo.png
$ ls *.txt
a.txt  b.txt
$ mkdir text
$ mv *.txt text/
```

The shell replaces `*.txt` with the matching names **before** the command runs, so `mv` really receives `mv a.txt b.txt text/`. When the last argument is a folder, `mv` and `cp` move or copy everything before it into that folder.

`?` matches exactly one character, so `file?.txt` matches `file1.txt` but not `file10.txt`.

## Hidden files

Names that start with a dot are hidden from a plain `ls`. They usually hold settings.

```console
$ ls -a
.  ..  .bashrc  .gitconfig  Documents
```

## Permissions

Each file records who may **r**ead it, **w**rite it and e**x**ecute (run) it:

```console
$ ls -l hello.sh
-rw-r--r-- 1 sam sam 32 May  3 10:12 hello.sh
```

Read the letters in groups of three: the owner, the group, everyone else. Here nobody has `x`, so the file cannot be run as a program yet. Add it with `chmod`:

```console
$ ./hello.sh
bash: ./hello.sh: Permission denied
$ chmod +x hello.sh
$ ./hello.sh
Hello!
```

The `./` matters. To run a program in the current folder you must say where it is. Typing just `hello.sh` makes the shell search only its list of system folders.

## Common mistakes

- **Forgetting where you are.** Relative paths depend on the working directory. When in doubt, `pwd`.
- **A wildcard that matches nothing** is passed along as plain text, which gives odd errors like `cannot stat '*.txt'`.
- **Spaces in names.** Avoid them in code folders. If you must, quote the name: `cat "my file.txt"`.
