# Rebase a branch

`feature` has two commits. Since it was created, `main` has gained one commit of its own, so the branches have diverged.

Rebase `feature` onto `main`, so that its two commits come after the newest commit of `main` and the history is a straight line. Do not use `git merge` to combine them.

Compare `git log --oneline --graph --all` before and after.
