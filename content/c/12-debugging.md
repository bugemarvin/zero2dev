---
title: Debugging
summary: Find bugs on purpose, with a method and with tools, in place of staring at the code and hoping.
---

## A method

1. **Reproduce it.** Find the smallest input that makes the bug happen every time.
2. **Read the message.** The file name and line number are in it.
3. **Form a guess** about the cause, one you can check.
4. **Test the guess.** Print a value, or stop in a debugger and look.
5. **Fix one thing**, then run again.

Changing several things at once, at random, is how a one-hour bug becomes a one-day bug.

## Printing

The simplest tool is often enough. Print to `stderr`, so that the debug lines stay separate from the real output:

```c
fprintf(stderr, "i=%d total=%d\n", i, total);
```

Remove these lines when you are done.

## Sanitizers

Compile with them whenever you are developing:

```console
$ gcc -Wall -Wextra -g -fsanitize=address,undefined prog.c -o prog
```

`-g` adds line numbers to the reports. The sanitizers stop the program at the instant something illegal happens and say where.

| Report contains | It means |
| --- | --- |
| `heap-buffer-overflow` | read or write past the end of a `malloc` block |
| `stack-buffer-overflow` | past the end of a local array |
| `heap-use-after-free` | used a block after `free` |
| `detected memory leaks` | a block was never freed |
| `signed integer overflow` | arithmetic went past the limit of the type |
| `SEGV on unknown address 0x000000000000` | dereferenced `NULL` |

A report looks like this:

```text
==4131==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x602000000024
READ of size 4 at 0x602000000024 thread T0
    #0 0x55e1 in reverse buggy.c:9
    #1 0x55e1 in main buggy.c:24

0x602000000024 is located 0 bytes after 20-byte region
allocated by thread T0 here:
    #0 0x7f3a in malloc
    #1 0x55e1 in main buggy.c:17
```

Read it in three parts: **what** happened (a read past the end of a heap block), **where** (line 9 of `buggy.c`, in `reverse`, called from line 24), and **which block** (20 bytes, allocated on line 17). "0 bytes after" means the access was at the very first position past the end, the classic off-by-one.

## gdb

A debugger runs your program under your control. You can stop it at any line and look at every variable.

```console
$ gcc -g prog.c -o prog
$ gdb ./prog
```

| Command | Short | What it does |
| --- | --- | --- |
| `break main` | `b` | stop when `main` starts |
| `break prog.c:12` | | stop at line 12 |
| `run` | `r` | start the program |
| `next` | `n` | run one line, stepping over function calls |
| `step` | `s` | run one line, stepping into function calls |
| `print total` | `p` | show the value of a variable or expression |
| `continue` | `c` | run until the next breakpoint |
| `backtrace` | `bt` | show the chain of function calls that led here |
| `quit` | `q` | leave |

When a program crashes, the quickest route to the cause is:

```console
$ gdb ./prog
(gdb) run
Program received signal SIGSEGV, Segmentation fault.
0x0000555555555171 in count (s=0x0) at prog.c:6
(gdb) bt
#0  count (s=0x0) at prog.c:6
#1  main () at prog.c:14
```

`s=0x0` shows that `count` was called with a `NULL` pointer, from line 14 of `main`.

## valgrind

`valgrind` finds memory errors too, without recompiling. It is slower than the sanitizers and useful when you cannot rebuild the program:

```console
$ valgrind --leak-check=full ./prog
```

Use it on a build **without** `-fsanitize`. The two do not work together.

## The usual suspects

When a C program misbehaves, check these first:

- **Uninitialised variable.** A counter or total that was never set to 0.
- **Off by one.** `<=` where `<` was meant, or a string buffer with no room for `'\0'`.
- **Missing `free`**, or a `free` in only one of several exit paths.
- **Using a pointer after the thing it pointed to is gone.**
- **`=` in a condition** where `==` was meant.
- **Integer division** producing 0.

## Common mistakes

- **Fixing the symptom.** If a value is wrong at line 40, find where it first became wrong.
- **Not reading the whole message.** The line number is right there.
- **Debugging without `-g`.** The reports show addresses with no file names or lines.

That is the end of the C track. The [data structures and algorithms](dsa/01-big-o) track builds on everything here.
