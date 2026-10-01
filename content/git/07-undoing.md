---
title: Undoing things
summary: Throw away an edit, unstage a file, fix the last commit, or reverse an old one. Pick the right tool for where the mistake is.
---

## Find where the mistake is

The right command depends on how far the mistake has travelled.

| The mistake is... | Use |
| --- | --- |
| an edit you have not staged | `git restore file` |
| staged, and should not be | `git restore --staged file` |
| in the last commit, not pushed yet | `git commit --amend` |
| in a commit you already pushed | `git revert commit` |

## Discard an edit

```console
$ git restore notes.txt
```

This puts the file back to how it was in the last commit.

> **Warning:** the discarded edits are gone for good. Git never saved them, so it cannot bring them back.

## Unstage a file

```console
$ git restore --staged draft.txt
```

The file leaves the staging area. Your edits stay in the working directory, untouched.

## Fix the last commit

Forgot a file, or made a typo in the message?

```console
$ git add forgotten.txt
$ git commit --amend -m "Add search page and its tests"
```

`--amend` replaces the last commit with a new one. Only do this to commits you have **not pushed**. Replacing a commit that other people already have causes trouble for them.

## Reverse an old commit

`git revert` makes a **new** commit that does the opposite of an earlier one. History is kept, and nothing is rewritten, so it is safe on shared branches.

```console
$ git log --oneline
e1f0a2b Add experimental cache
9b1d3e7 Add pancake recipe
$ git revert --no-edit e1f0a2b
[main 7c4d9e2] Revert "Add experimental cache"
```

Revert needs a clean staging area. Commit or unstage other changes first.

## Reset

`git reset` moves the current branch label back to an earlier commit. The three modes differ in what happens to the changes from the commits you stepped back over.

| Command | Commits | Changes |
| --- | --- | --- |
| `git reset --soft HEAD~1` | removed from the branch | kept, staged |
| `git reset HEAD~1` | removed from the branch | kept, unstaged |
| `git reset --hard HEAD~1` | removed from the branch | **deleted** |

`HEAD~1` means *one commit before the current one*.

Like `--amend`, reset rewrites history. Use it only on commits you have not pushed.

## The safety net

Git remembers every position `HEAD` has been in, for weeks:

```console
$ git reflog
7c4d9e2 HEAD@{0}: revert: Revert "Add experimental cache"
e1f0a2b HEAD@{1}: commit: Add experimental cache
```

If a reset removed a commit you wanted, find its hash here and return to it with `git reset --hard e1f0a2b`. **Committed work is very hard to lose.** Uncommitted work is easy to lose, which is one more reason to commit often.

## Common mistakes

- **`git reset --hard` with uncommitted work.** It is the one command here that destroys things with no way back.
- **Amending or resetting pushed commits.** Use `git revert` on anything other people may have.
- **Using `revert` when you meant `restore`.** Revert reverses a commit. Restore puts a file back.
