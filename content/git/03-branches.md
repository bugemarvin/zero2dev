---
title: Branches
summary: Work on something new without touching the version that works.
---

## What a branch is

A **branch** is a movable label that points at a commit. That is the whole thing. Creating one is instant and costs nothing.

When you commit, the label you are on moves forward to the new commit. Other labels stay where they are. So two branches can grow in different directions from the same starting point:

```text
          main
           |
A --- B --- C
       \
        D --- E
              |
        feature/search
```

`main` is the default branch and normally holds the version that works. You build each new piece of work on its own branch and bring it into `main` when it is ready.

## HEAD

`HEAD` is Git's name for *where you are right now*. Usually it points at a branch, and that branch points at a commit. `git status` and `git log` both show it:

```console
$ git log --oneline
c81e728 (HEAD -> main) Add pancake recipe
```

## Creating and switching

```console
$ git switch -c feature/search
Switched to a new branch 'feature/search'
```

`-c` means *create*. Without it, `git switch name` moves to a branch that already exists.

| Command | What it does |
| --- | --- |
| `git branch` | list branches, with `*` on the current one |
| `git switch -c name` | create a branch and move to it |
| `git switch name` | move to an existing branch |
| `git switch -` | go back to the branch you were on before |
| `git branch -d name` | delete a branch that has been merged |

You will also see the older `git checkout name` and `git checkout -b name`. They do the same job.

## Switching changes your files

When you switch branches, Git rewrites the files in your working directory to match the branch. A file that exists only on `feature/search` disappears from the folder when you go back to `main`, and returns when you switch again. Nothing is lost. It is stored in the repository.

```console
$ git switch -c feature/search
$ echo "search notes" > search.txt
$ git add search.txt
$ git commit -m "Add search notes"
$ ls
README.md  search.txt
$ git switch main
$ ls
README.md
```

## Seeing all branches at once

```console
$ git log --oneline --graph --all
* 7d2f1aa (feature/search) Add search notes
* c81e728 (HEAD -> main) Add pancake recipe
* 4f2a9c1 Add README
```

## Naming

Use short names that say what the branch is for, with a prefix for the kind of work: `feature/search`, `fix/login-crash`, `docs/install-guide`.

## Common mistakes

- **Committing on the wrong branch.** Run `git status` before you start. The first line tells you where you are.
- **Switching with unsaved changes.** Git either carries them along or refuses to switch. Commit first, and switching is always clean.
- **Thinking a branch is a copy of the files.** It is only a label. The commits are shared.
