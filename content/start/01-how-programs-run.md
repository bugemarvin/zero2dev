---
title: How programs run
summary: What a program actually is, and what happens between typing code and seeing a result.
---

## A program is a text file

A program is a list of instructions written in a text file. That is all. You could write one in Notepad. The file is called **source code**.

The computer's processor (the CPU) cannot read that text. It only understands numbers that mean very small steps: *add these two values*, *copy this value there*, *jump to that instruction*. Those numbers are called **machine code**.

So something has to translate your text into machine code. There are two common ways.

## Compiled and interpreted

A **compiler** translates the whole file once and writes a new file that the CPU can run directly. C works like this:

```console
$ gcc hello.c -o hello
$ ./hello
Hello!
```

The first command translates `hello.c` into a program named `hello`. The second command runs it. If you change the source, you compile again.

An **interpreter** reads your file and carries out the instructions as it goes, with no separate file in between. Python works like this:

```console
$ python3 hello.py
Hello!
```

| | Compiled (C, Go, Rust) | Interpreted (Python, Ruby, Bash) |
| --- | --- | --- |
| Steps to run | compile, then run | run |
| Speed | fast | slower |
| Mistakes found | many at compile time | mostly while running |

Some languages sit in between. Java and Elixir compile to an in-between format that a second program (a *virtual machine*) then runs. You will meet both in their own tracks.

## The operating system

Your program never talks to the screen, the keyboard or the disk directly. It asks the **operating system** (Windows, Linux, macOS) to do it. The operating system also decides which program gets the CPU and how much memory each one can use.

This guide uses **Linux**, because most servers and most developer tools run on it. On Windows you get Linux through WSL, which the next lesson sets up.

## Input and output

Almost every program you write in this guide has the same shape:

1. Read some input.
2. Work on it.
3. Print some output.

That shape is also how your work gets tested here. The checker gives your program an input, looks at what it prints, and compares that with the expected answer:

```console
$ python3 check.py c/01-hello
c/01-hello  Hello, C
  ✓ compiles without warnings
  ✓ prints the greeting
  PASSED 2/2
```

## Mistakes are normal

Programs have three kinds of mistake, and you will make all of them every day:

- **Syntax errors**: the text breaks the rules of the language, like a missing bracket. The compiler or interpreter refuses to run it and tells you the line.
- **Runtime errors**: the program starts, then does something impossible, like dividing by zero. It stops with an error message.
- **Logic errors**: the program runs fine and gives the wrong answer. Tests catch these.

> Read error messages slowly, from the top. They nearly always name the file and the line number. That habit alone solves most problems.

## What comes next

- [Install your tools](start/02-install)
- Learn the [terminal](start/03-terminal), where all of this happens
