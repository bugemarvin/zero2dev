---
title: The pull request workflow
summary: How teams actually use Git. A branch per change, a review, then a merge.
---

## The shape of the workflow

On almost every team, nobody commits straight to `main`. Each change goes through the same steps:

1. Update your local `main`.
2. Create a branch for the change.
3. Commit your work on it.
4. Push the branch.
5. Open a **pull request** (PR): a page that shows your changes and asks for them to be merged.
6. Other people review, and you push fixes to the same branch.
7. The PR is merged into `main`.
8. Delete the branch and start again from step 1.

## In commands

```console
$ git switch main
$ git pull
$ git switch -c fix/typo
```

Edit, then commit:

```console
$ git add README.md
$ git commit -m "Fix typo in install steps"
$ git push -u origin fix/typo
```

Open the pull request with the GitHub CLI:

```console
$ gh pr create --title "Fix typo in install steps" --body "The word 'the' was misspelled."
```

Or open the repository page on GitHub, where a button offers to create the PR from the branch you just pushed.

## During review

Reviewers comment on lines. To respond, commit more changes on the same branch and push. The PR updates itself.

```console
$ git add README.md
$ git commit -m "Reword the sentence as suggested"
$ git push
```

## After the merge

```console
$ git switch main
$ git pull
$ git branch -d fix/typo
```

## Contributing to a project you do not own

You cannot push to someone else's repository. You make your own copy on GitHub, called a **fork**, push your branch there, and open the PR from your fork to the original.

```console
$ gh repo fork someone/recipes --clone
```

## Writing a good pull request

- **Keep it small.** A PR that changes 50 lines is reviewed carefully. One that changes 2,000 is skimmed.
- **One purpose.** Do not mix a bug fix with a redesign.
- **Say why** in the description. The diff already shows *what* changed.
- **Run the tests first.** Do not make a reviewer find what a test would have.

## Git commands worth keeping close

| Goal | Command |
| --- | --- |
| What is going on? | `git status` |
| What changed? | `git diff`, `git diff --staged` |
| History | `git log --oneline --graph --all` |
| New branch | `git switch -c name` |
| Save work | `git add`, `git commit -m` |
| Share work | `git push -u origin name` |
| Get updates | `git pull` |
| Undo an edit | `git restore file` |
| Reverse a commit | `git revert hash` |

You now know the Git that covers nearly all daily work. Next, pick a language: [C](c/01-hello) shows you how the machine works, Python gets you productive fastest.
