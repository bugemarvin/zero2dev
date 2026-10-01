# Commit a change and ignore the junk

Your working folder is a repository with one commit. It also contains a log file and a `build` folder that must never be committed.

1. Add a second line to `app.txt` and commit the change.
2. Create a `.gitignore` that ignores every `.log` file and the whole `build/` folder.
3. Commit `.gitignore`.

Do not delete `debug.log` or `build/`. When you finish, `git status` should be clean and `git log --oneline` should show at least three commits.
