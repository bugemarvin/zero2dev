---
title: Your editor and the work loop
summary: Set up VS Code, and learn the edit, run, check loop you will repeat for every exercise.
---

## Open the project in VS Code

From the terminal, inside the project folder:

```console
$ cd ~/zero2dev
$ code .
```

The dot means *this folder*. On Windows with WSL, VS Code opens connected to Linux, and the bottom-left corner shows **WSL: Ubuntu**. If it does not, install the **WSL** extension and run `code .` again from the Ubuntu terminal.

VS Code has its own terminal. Open it with **Ctrl+`** (the key under Esc). Now the code and the terminal sit in one window.

## Worth setting once

- **Auto Save**: File menu, then Auto Save. Running old code because you forgot to save is the most common beginner bug.
- **Extensions**: C/C++ and Python, both from Microsoft. The setup script installs them on Windows.
- **Line endings**: bottom right of the window. It must say `LF` for scripts.

## A terminal-only editor

Sometimes you only have a terminal, for example on a server. `nano` is always there and shows its shortcuts at the bottom of the screen:

```console
$ nano notes.txt
```

`Ctrl+O` then Enter saves. `Ctrl+X` exits.

## The work loop

Every exercise in this guide goes the same way.

**1. Find the next task.**

```console
$ python3 check.py next
Next: start/04-greet  Greet by name
  Lesson:  guide/lessons/start/06-shell-scripts.html
  Task:    exercises/start/04-greet/README.md
  Check:   python3 check.py start/04-greet
```

**2. Read the task**, then open the starter file in the exercise folder and write your code.

**3. Run the tests.**

```console
$ python3 check.py start/04-greet
start/04-greet  Greet by name
  ✓ has no syntax errors
  ✓ greets the name given
  ✗ prints usage when no name is given
      the program exited with code 0, expected exit code 1
  FAILED 2/3 passed
```

**4. Read the failure.** It shows what went in, what was expected and what your program did. Fix one thing, run again.

**5. Passed?** Move on. Your progress appears on the home page of this guide.

## Checker commands

| Command | What it does |
| --- | --- |
| `python3 check.py next` | the next exercise you have not passed |
| `python3 check.py start/04` | run one exercise (a unique start of the name is enough) |
| `python3 check.py start` | run a whole track |
| `python3 check.py list` | every exercise and its status |
| `python3 check.py progress` | totals per track |
| `python3 check.py hint start/04` | hints, when you are stuck |
| `python3 check.py doctor` | which languages are installed |

## When you are stuck

1. Read the error message again, slowly. Find the line number.
2. Make the problem smaller. Test one small piece on its own.
3. Print values to see what the program is really doing.
4. Ask for the hint.
5. Take a break. A surprising number of bugs solve themselves on a walk.

Next up: [Git](git/01-first-commit), so that none of your work is ever lost.
