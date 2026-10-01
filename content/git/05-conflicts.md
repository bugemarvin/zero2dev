---
title: Merge conflicts
summary: When two branches change the same lines, Git asks you to decide. It looks alarming and is routine.
---

## Why they happen

Git merges changes automatically when they touch different lines. When two branches change **the same lines** in different ways, Git cannot know which one you want. It stops and asks.

```console
$ git merge feature/blue
Auto-merging colors.txt
CONFLICT (content): Merge conflict in colors.txt
Automatic merge failed; fix conflicts and then commit the result.
```

Nothing is broken. The merge is paused, waiting for you.

## What the file looks like

Git writes both versions into the file, with markers around them:

```text
Colors we like
<<<<<<< HEAD
favorite: green
=======
favorite: blue
>>>>>>> feature/blue
```

- Between `<<<<<<< HEAD` and `=======` is the version from **your current branch**.
- Between `=======` and `>>>>>>> feature/blue` is the version from the **branch being merged**.

## Resolving it

1. **Open the file** and decide what the lines should be. Keep one side, keep the other, or write something new that combines them.
2. **Delete all three marker lines.** The file must end up as normal content.
3. **Stage the file** to tell Git it is resolved.
4. **Commit** to finish the merge.

After editing, the file might read:

```text
Colors we like
favorite: blue-green
```

```console
$ git add colors.txt
$ git commit --no-edit
[main 5e2d7b4] Merge branch 'feature/blue'
```

`git status` shows you where you are at every step, including which files still have conflicts.

## Changing your mind

To give up on the merge and return to how things were before it started:

```console
$ git merge --abort
```

## Fewer, smaller conflicts

- **Merge often.** A branch that lives for a day conflicts far less than one that lives for a month.
- **Keep commits focused.** One change per commit makes each conflict easy to understand.
- **Do not reformat whole files** in the same commit as a real change. It makes every line conflict.

## Common mistakes

- **Leaving a marker in the file.** The code no longer runs, and the marker gets committed. Search the file for `<<<<<<<` before you stage it.
- **Staging without resolving.** `git add` only tells Git the file is ready. It does not check that the content makes sense.
- **Panicking and deleting the folder.** `git merge --abort` is always available until you commit.
