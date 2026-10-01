---
title: History and diff
summary: Read the history, see exactly what changed, and keep junk files out of the repository.
---

## Reading history

```console
$ git log
commit 9b1d3e7c0a... (HEAD -> main)
Author: Sam Example <sam@example.com>
Date:   Mon May 5 10:21:03 2025

    Add pancake recipe

commit 4f2a9c1e55...
Author: Sam Example <sam@example.com>
Date:   Mon May 5 10:02:47 2025

    Add README
```

The newest commit is at the top. The long code is the commit's **hash**: its unique ID. The first seven characters are usually enough to name it.

A shorter view is what you will use most:

```console
$ git log --oneline
9b1d3e7 Add pancake recipe
4f2a9c1 Add README
```

`git show 9b1d3e7` prints one commit: its message and the exact lines it changed.

## What changed?

`git diff` compares versions line by line.

| Command | Compares |
| --- | --- |
| `git diff` | working directory against the staging area: what you have **not** staged |
| `git diff --staged` | staging area against the last commit: what the next commit **will** contain |
| `git diff 4f2a9c1 9b1d3e7` | two commits |

```console
$ git diff
--- a/README.md
+++ b/README.md
@@ -1 +1,2 @@
 # My recipes
+Collected by Sam.
```

Lines starting with `+` were added, lines starting with `-` were removed. Lines with neither are context.

Make a habit of running `git diff --staged` right before you commit. It is the last chance to catch a stray debug line.

## Ignoring files

Some files should never be committed: compiled programs, logs, editor settings, passwords. List patterns for them in a file named `.gitignore` at the top of the repo:

```text
# compiled output
build/
*.o

# logs
*.log

# secrets
.env
```

- `*.log` ignores every file ending in `.log`.
- `build/` ignores the whole folder.
- Lines starting with `#` are comments.

Commit `.gitignore` itself, so everyone on the project shares it.

```console
$ git status
Untracked files:
        debug.log
$ echo "*.log" > .gitignore
$ git status
Untracked files:
        .gitignore
```

The log has vanished from the list, and the ignore file is now the thing to add.

> **Warning:** `.gitignore` only affects files Git is not tracking yet. If a file was already committed, ignoring it later does nothing until you remove it with `git rm --cached file`.

## Common mistakes

- **Committing a password or API key.** Deleting it in a later commit does not remove it from history. Treat it as leaked and change it.
- **Stuck in a screen full of `git log`.** It opened in a pager. Press `q`.
- **Confusing `git diff` with `git diff --staged`.** An empty `git diff` after `git add` is normal: everything is staged, so nothing is left unstaged.
