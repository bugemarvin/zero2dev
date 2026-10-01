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

Every exercise in this guide goes the same way, and there are two places to do it.

### In the app

Start it once with `python3 app.py`. A lesson that has exercises opens with a **workspace** panel on the right: the lesson stays on the left, and the editor, the Run button and the results sit beside it. Drag the panel's left edge to resize it, widen it to the full page with the arrow button, or close it and bring it back with the Workspace tab at the right edge.

1. Read the task, in the lesson or at the top of the panel.
2. Write your code in the editor. It is saved into the exercise folder, so the same file is there for VS Code.
3. Press **Run tests**, or Ctrl+Enter. Each test shows a tick or a cross, with what was expected and what your program did.
4. Fix one thing and run again. **Hint** reveals a hint, and **Reset** brings the starter back.

Exercises on Git and the shell have a command line in the panel in place of an editor: type a command, press Enter, and then **Check my work**.

### In a terminal, with your own editor

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
  ✗ with no name: prints nothing on stdout and exits with code 1
      the program exited with code 0, expected exit code 1
  FAILED 2/3 passed
```

**4. Read the failure.** It shows what went in, what was expected and what your program did. Fix one thing, run again.

Both ways use the same files and record the same progress, so you can switch at any time.

## Checker commands

| Command | What it does |
| --- | --- |
| `python3 check.py next` | the next exercise you have not passed |
| `python3 check.py start/04` | run one exercise (a unique start of the name is enough) |
| `python3 check.py start` | run a whole track |
| `python3 check.py list` | every exercise and its status |
| `python3 check.py progress` | totals per track |
| `python3 check.py hint start/04` | hints, when you are stuck |
| `python3 check.py doctor` | what this machine has, and what Docker can supply |
| `python3 check.py stacks` | the tracks, and whether this machine is ready for each |

## When you are stuck

1. Read the error message again, slowly. Find the line number.
2. Make the problem smaller. Test one small piece on its own.
3. Print values to see what the program is really doing.
4. Ask for the hint.
5. Take a break. A surprising number of bugs solve themselves on a walk.

Next up: [Git](git/01-first-commit), so that none of your work is ever lost.
