---
title: The terminal
summary: Type commands instead of clicking. Move around, look at files, and make folders.
---

## What you are looking at

When you open the terminal you see a **prompt**, something like this:

```console
$ 
```

Yours may show your user name and current folder before the `$`. The prompt means: *I am waiting for a command*. You type a command, press Enter, read the result, and get a new prompt.

In this guide, lines that start with `$` are commands for you to type. **Do not type the `$` itself.** Lines without it show what the computer prints back.

## Where am I?

The terminal is always "in" one folder, called the **working directory**. Three commands tell you where you are and let you move:

```console
$ pwd
/home/sam
$ ls
Documents  Downloads  zero2dev
$ cd zero2dev
$ pwd
/home/sam/zero2dev
```

- `pwd` prints the working directory.
- `ls` lists what is in it.
- `cd name` moves into a folder. `cd ..` moves one level up. `cd` alone takes you home.

## Commands, options, arguments

Most commands follow one pattern:

```text
command  -options  arguments
```

```console
$ ls -l Documents
```

Here `ls` is the command, `-l` is an option that means *long format*, and `Documents` is the argument: the thing to act on. Options can be combined, so `ls -la` means `-l` and `-a` (show hidden files too).

## Making and removing things

| Command | What it does |
| --- | --- |
| `mkdir notes` | make a folder |
| `mkdir -p a/b/c` | make a folder and any missing parents |
| `touch todo.txt` | make an empty file |
| `cp a.txt b.txt` | copy a file |
| `cp -r dir1 dir2` | copy a folder and everything in it |
| `mv old.txt new.txt` | rename, or move to another folder |
| `rm file.txt` | delete a file |
| `rm -r folder` | delete a folder and everything in it |

> **Warning:** `rm` deletes for good. There is no recycle bin in the terminal. Read the command once more before you press Enter, especially with `rm -r`.

## Three habits that save hours

- **Tab completes names.** Type `cd Doc` and press Tab. The terminal finishes `Documents/`. If nothing happens, press Tab twice to see the choices.
- **Up arrow repeats.** Press it to bring back earlier commands. `Ctrl+R` searches through them.
- **`Ctrl+C` stops** whatever is running and gives you the prompt back.

## Getting help

```console
$ man ls
$ ls --help
```

`man` opens the manual page. Move with the arrow keys, press `/` to search, and `q` to quit. Most commands also accept `--help` for a short summary.

## Common mistakes

- **Spaces separate arguments.** `mkdir my project` makes two folders, `my` and `project`. Use `mkdir my-project`, or put quotes around the name: `mkdir "my project"`.
- **Upper and lower case differ.** `Notes.txt` and `notes.txt` are two different files on Linux.
- **`No such file or directory`** almost always means you are not in the folder you think you are. Run `pwd` and `ls`.
