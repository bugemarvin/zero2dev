---
title: Merging
summary: Bring the work from one branch into another.
---

## The idea

`git merge` takes the commits of another branch and joins them into the branch you are **on**. So the routine is always:

```console
$ git switch main
$ git merge feature/search
```

*Switch to the branch that should receive the work, then name the branch to bring in.*

There are two ways it can go.

## Fast-forward

If `main` has not moved since the branch was created, there is nothing to combine. Git just slides the `main` label forward:

```text
Before                          After
A --- B  (main)                 A --- B --- C --- D  (main, feature)
       \
        C --- D  (feature)
```

```console
$ git merge feature/search
Updating c81e728..7d2f1aa
Fast-forward
 search.txt | 1 +
```

No new commit is made. History stays a straight line.

## Merge commit

If both branches have new commits, they have **diverged**. Git combines them and records a new commit with two parents:

```text
A --- B --- E --------- M  (main)
       \               /
        C --- D ------    (feature)
```

```console
$ git merge feature/search
Merge made by the 'ort' strategy.
 search.txt | 1 +
```

Git opens an editor for the merge message. The default text is fine: save and close. To skip the editor, add `--no-edit`.

When the two branches changed different files, or different parts of the same file, Git combines them without help. When they changed the same lines, you get a **conflict**, which is the next lesson.

## Checking the result

```console
$ git log --oneline --graph
*   a3c9e10 (HEAD -> main) Merge branch 'feature/search'
|\
| * 7d2f1aa (feature/search) Add search notes
* | 2be4410 Fix typo in README
|/
* c81e728 Add pancake recipe
```

## After the merge

The feature branch label is no longer needed. Its commits are part of `main` now.

```console
$ git branch -d feature/search
Deleted branch feature/search (was 7d2f1aa).
```

`-d` refuses to delete a branch whose work has not been merged, which protects you from losing commits.

## Common mistakes

- **Merging in the wrong direction.** `git merge main` while on the feature branch pulls `main` into the feature. Useful sometimes, but it does not update `main`.
- **Stuck in the editor.** If it is Vim: type `:wq` and press Enter. If it is nano: `Ctrl+O`, Enter, `Ctrl+X`.
- **Merging with uncommitted changes.** Commit first. A clean working tree makes every merge easier to undo.
