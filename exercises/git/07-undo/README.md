# Three kinds of undo

Run `git status` and `git log --oneline` to see the state of your working folder. Three things are wrong:

1. `draft.txt` is staged, and it should not be. Unstage it. Keep the file.
2. `notes.txt` has an unwanted edit. Discard the edit.
3. The last commit added `bad.txt`, which contains a password. Reverse that commit with `git revert`, so the file is gone and the history still shows what happened.

Do them in that order.
