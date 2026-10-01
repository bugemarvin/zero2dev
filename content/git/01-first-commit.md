---
title: Your first commit
summary: Git takes snapshots of your project so you can always go back. Make a repository and save your first snapshot.
---

## Why Git

Without Git, projects end up as `essay-final.txt`, `essay-final-2.txt`, `essay-REALLY-final.txt`. Git replaces that with a history of **commits**. Each commit is a snapshot of every file at one moment, with a message saying what changed and why.

You can look at any earlier snapshot, see exactly what changed between two of them, undo a mistake, and work with other people without overwriting each other.

## Tell Git who you are

Do this once per machine. The name and email are written into every commit you make.

```console
$ git config --global user.name "Sam Example"
$ git config --global user.email "sam@example.com"
```

## Make a repository

A **repository** (repo) is a folder that Git is tracking. Turn any folder into one with `git init`:

```console
$ mkdir recipes
$ cd recipes
$ git init
Initialized empty Git repository in /home/sam/recipes/.git/
```

Git keeps all its data in the hidden `.git` folder. Leave that folder alone, and never run `git init` inside a repo that already exists.

## The three places

A file's changes move through three places:

| Place | What it is |
| --- | --- |
| Working directory | the files as you see and edit them |
| Staging area | the changes you have picked for the next commit |
| Repository | the saved history of commits |

`git add` moves changes from the first to the second. `git commit` moves them from the second to the third.

## Save a snapshot

Create a file, then ask Git what it sees:

```console
$ echo "# My recipes" > README.md
$ git status
On branch main
No commits yet
Untracked files:
        README.md
```

**Untracked** means Git has noticed the file and is not saving it yet. Stage it, then commit:

```console
$ git add README.md
$ git commit -m "Add README"
[main (root-commit) 4f2a9c1] Add README
 1 file changed, 1 insertion(+)
$ git status
On branch main
nothing to commit, working tree clean
```

**Working tree clean** means everything is saved.

## The loop

You will repeat this for the rest of your career:

1. Edit files.
2. `git status` to see what changed.
3. `git add` the changes that belong together.
4. `git commit -m "message"`.

`git add .` stages everything in the current folder. Check `git status` first so that you know what "everything" is.

## Good commit messages

- Say **what the change does**: `Add login form`, `Fix crash when cart is empty`.
- Start with a verb, keep the first line under about 50 characters.
- One idea per commit. If the message needs the word "and", it is probably two commits.

## Common mistakes

- **Forgetting `git add`.** `git commit` only saves what is staged. A new file that was never added is not in the commit.
- **Running `git init` in your home folder.** Git then tries to track everything you own. Always `cd` into the project first.
- **`Author identity unknown`.** You skipped the `git config` step above.
