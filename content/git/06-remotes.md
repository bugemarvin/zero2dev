---
title: Remotes and GitHub
summary: A remote is another copy of the repository. Clone it, push your commits to it, pull other people's commits from it.
---

## Local and remote

Everything so far happened on your own machine. A **remote** is a copy of the repository stored somewhere else, usually on a service like GitHub. It gives you a backup and a place to share work.

A remote does not have to be on the internet. It can be another folder on the same disk, which is how the exercise for this lesson works offline. The commands are identical.

## Cloning

`git clone` downloads a repository with its whole history:

```console
$ git clone https://github.com/someone/recipes.git
Cloning into 'recipes'...
$ cd recipes
$ git remote -v
origin  https://github.com/someone/recipes.git (fetch)
origin  https://github.com/someone/recipes.git (push)
```

Git names the place you cloned from `origin`.

## Push

`git push` uploads your new commits to the remote:

```console
$ git add notes.txt
$ git commit -m "Add notes"
$ git push
```

The first time you push a **new branch**, tell Git where it goes. `-u` links your local branch to the one on the remote, so that a plain `git push` works afterwards:

```console
$ git push -u origin feature/search
```

## Pull and fetch

| Command | What it does |
| --- | --- |
| `git fetch` | download new commits from the remote, change nothing in your files |
| `git pull` | fetch, then merge the remote branch into your current branch |

`origin/main` is your machine's record of where `main` was on the remote the last time you fetched. `git status` compares against it:

```console
$ git status
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
```

*Ahead* means you have commits to push. *Behind* means there are commits to pull.

## When a push is rejected

```console
$ git push
 ! [rejected]        main -> main (fetch first)
```

Someone else pushed before you. Git will not overwrite their work. Pull first to combine their commits with yours, then push again:

```console
$ git pull
$ git push
```

## Putting your own project on GitHub

With the GitHub CLI installed by the setup script:

```console
$ gh auth login
$ gh repo create my-project --public --source . --push
```

`gh auth login` runs once per machine. The second command creates the repository on GitHub, adds it as `origin`, and pushes.

## Common mistakes

- **Committing and thinking it is backed up.** A commit lives only on your machine until you push.
- **`git push --force` to get past a rejection.** It deletes the other person's commits from the remote. Pull instead.
- **Cloning inside another repository.** Clone into a plain folder, not into an existing repo.
