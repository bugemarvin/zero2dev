---
title: Rebase
summary: Replay your commits on top of the latest work to keep history in a straight line.
---

## The problem it solves

You started a branch from `main`. While you worked, `main` moved on:

```text
A --- B --- E --- F  (main)
       \
        C --- D  (feature)
```

Merging would work, and it adds a merge commit. **Rebase** offers a different result: it lifts your commits off and replays them on top of the newest `main`.

```text
A --- B --- E --- F  (main)
                   \
                    C' --- D'  (feature)
```

Your branch now looks as if you had started it today. History is a straight line, which is easier to read.

## Doing it

```console
$ git switch feature
$ git rebase main
Successfully rebased and updated refs/heads/feature.
```

*Switch to the branch that should move, then name the branch it should sit on top of.*

`C'` and `D'` contain the same changes as `C` and `D`. They are **new commits with new hashes**, because their parent changed.

Afterwards, merging the feature into `main` is a fast-forward:

```console
$ git switch main
$ git merge feature
Fast-forward
```

## Conflicts during a rebase

Git replays one commit at a time. If a commit conflicts, the rebase pauses on it:

1. Fix the file, exactly as in a [merge conflict](git/05-conflicts).
2. `git add` the file.
3. `git rebase --continue`.

To give up and return to how the branch was: `git rebase --abort`.

## The golden rule

**Never rebase commits that other people already have.**

Rebase replaces commits with new ones. If someone else built on the old ones, their history and yours no longer match. So:

- Rebase your **own, unpushed** branch as much as you like.
- Use **merge** on shared branches like `main`.

## Merge or rebase?

| | Merge | Rebase |
| --- | --- | --- |
| History | shows the true shape, with merge commits | straight line |
| Existing commits | untouched | replaced by new ones |
| Safe on shared branches | yes | no |
| Good for | bringing finished work into `main` | updating your own branch before that |

Many teams use both: rebase your branch onto the latest `main`, then merge it.

## Tidying commits

`git rebase -i HEAD~3` opens a list of your last three commits. You can reorder them, reword their messages, or **squash** several small commits into one. It is the same operation under the same rule: only on commits you have not shared.

`git pull --rebase` fetches the remote's commits and replays yours on top, in place of making a merge commit.

## Common mistakes

- **Rebasing in the wrong direction.** `git rebase feature` while on `main` rewrites `main`. Check `git status` first.
- **Rebasing a pushed branch and then needing `--force`.** If you must, use `git push --force-with-lease`, which refuses to overwrite commits you have not seen.
- **Forgetting `--continue`.** After fixing a conflict the rebase is still paused. `git status` tells you so.
