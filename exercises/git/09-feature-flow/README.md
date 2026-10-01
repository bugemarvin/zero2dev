# A full feature-branch round trip

`remote.git` in your working folder plays the part of the team repository. Its `README.md` has a typo: `teh`.

Do what you would do on a real team, up to the point of opening the pull request:

1. Clone `remote.git` into a folder named `project`.
2. Create a branch named `fix/typo`.
3. Change `teh` to `the` in `README.md` and commit.
4. Push the branch to the remote with `-u`, so that it tracks `origin/fix/typo`.

Do not commit to `main`.
