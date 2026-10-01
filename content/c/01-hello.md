---
title: Hello, C
summary: Write, compile and run your first C program, and learn to read what the compiler tells you.
---

## Why start with C

C is small, and it hides very little. You see how memory, numbers and text really work inside the machine. Languages like Python, Java and JavaScript are themselves built in C or its descendants, so what you learn here explains a lot of what they do for you.

## The program

Create a file named `hello.c`:

```c
#include <stdio.h>

int main(void) {
    printf("Hello, world!\n");
    return 0;
}
```

Line by line:

- `#include <stdio.h>` brings in the declarations for input and output functions, including `printf`.
- `int main(void)` defines the function where every C program starts. `int` says it returns a whole number. `void` says it takes no arguments.
- The braces `{ }` hold the body of the function.
- `printf("...")` prints text. `\n` is the newline character. Without it, the next output continues on the same line.
- Every statement ends with a semicolon.
- `return 0;` ends the program and reports success to the operating system. Remember [exit codes](start/06-shell-scripts): 0 means success.

## Compile and run

```console
$ gcc hello.c -o hello
$ ./hello
Hello, world!
```

`gcc` is the compiler. `-o hello` names the output file. Without it the program is called `a.out`.

## Turn the warnings on

By default the compiler stays quiet about code that is legal but suspicious. Always ask for warnings:

```console
$ gcc -Wall -Wextra hello.c -o hello
```

| Flag | Meaning |
| --- | --- |
| `-Wall` | the common warnings |
| `-Wextra` | more warnings |
| `-Werror` | treat every warning as an error |
| `-g` | include information for the debugger |
| `-o name` | name of the program to produce |

The checker in this guide compiles with `-Wall -Wextra -Werror`, so a warning fails the build. That is on purpose. In C, a warning is nearly always a real bug.

## Reading a compiler error

Remove the semicolon after `printf(...)` and compile:

```text
hello.c: In function 'main':
hello.c:4:30: error: expected ';' before 'return'
    4 |     printf("Hello, world!\n")
      |                              ^
      |                              ;
    5 |     return 0;
```

The format is `file:line:column: error: message`. Go to that line. If the line looks fine, look at the line **above**: a missing semicolon or bracket is usually reported where the compiler noticed it, which is a little later than where it happened.

Fix the **first** error, then compile again. Later errors are often caused by the first one.

## Comments

```c
// A comment that runs to the end of the line.

/* A comment that can
   span several lines. */
```

The compiler ignores comments. Use them to explain *why* the code does something, when the reason is not obvious from the code.

## Common mistakes

- **Forgetting `\n`**, so that your output and the next prompt run together.
- **Editing the file and forgetting to compile again.** You then run the old program.
- **Writing `Printf` or `Main`.** C is case-sensitive.
- **Running `hello` with no `./`**, which gives `command not found`.
