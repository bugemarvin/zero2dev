---
title: Headers and Makefiles
summary: Split a program across several files, and let make rebuild only what changed.
---

## Why split a program

One file is fine for 100 lines. At 5,000 it is hard to find anything, and every small change recompiles everything. Real C programs are split into several `.c` files, each with a matching `.h` **header**.

- The **`.c` file** contains the function definitions: the actual code.
- The **`.h` file** contains the declarations: what other files need to know in order to call those functions.

## A small example

`greet.h` says what exists:

```c
#ifndef GREET_H
#define GREET_H

void greet(const char *name);

#endif
```

`greet.c` provides it:

```c
#include <stdio.h>
#include "greet.h"

void greet(const char *name) {
    printf("Hello, %s\n", name);
}
```

`main.c` uses it:

```c
#include "greet.h"

int main(void) {
    greet("make");
    return 0;
}
```

Use `#include "file.h"` with quotes for your own headers, and `#include <file.h>` with angle brackets for system ones.

## Include guards

The three lines `#ifndef`, `#define` and `#endif` are an **include guard**. If a header is included twice, by two different routes, the guard makes the second copy empty. Without it you get "redefinition" errors. Put one in every header, with a unique name.

## Compiling in two steps

Building a program is really two jobs:

1. **Compile** each `.c` file into an **object file** (`.o`): machine code with gaps where it calls functions defined elsewhere.
2. **Link** the object files together, filling in those gaps, to make the program.

```console
$ gcc -Wall -Wextra -c main.c
$ gcc -Wall -Wextra -c greet.c
$ gcc main.o greet.o -o app
$ ./app
Hello, make
```

`-c` means *compile only, do not link*. The advantage: after changing `greet.c`, only `greet.o` needs rebuilding.

An `undefined reference to 'greet'` error comes from the linker. It means a function was declared and called, and no object file that defines it was given.

## make

Typing those commands by hand does not scale. `make` reads a file named `Makefile` that describes what depends on what, and runs only the commands that are needed.

A rule has three parts:

```text
target: dependencies
	command
```

> **Warning:** the command line must start with a real **Tab** character, not spaces. This is the most common Makefile error. It shows up as `missing separator`.

A Makefile for the example:

```text
CC = gcc
CFLAGS = -Wall -Wextra -g

all: app

app: main.o greet.o
	$(CC) $(CFLAGS) main.o greet.o -o app

main.o: main.c greet.h
	$(CC) $(CFLAGS) -c main.c

greet.o: greet.c greet.h
	$(CC) $(CFLAGS) -c greet.c

clean:
	rm -f app *.o

.PHONY: all clean
```

- `make` with no arguments builds the **first** target, here `all`, which depends on `app`.
- A target is rebuilt when it does not exist, or when any of its dependencies is newer than it. That is how `make` skips unnecessary work.
- `CC` and `CFLAGS` are variables. `$(CC)` uses one.
- `clean` deletes what was built.
- `.PHONY` marks targets that are commands, not files.

```console
$ make
gcc -Wall -Wextra -g -c main.c
gcc -Wall -Wextra -g -c greet.c
gcc -Wall -Wextra -g main.o greet.o -o app
$ make
make: Nothing to be done for 'all'.
$ touch greet.c
$ make
gcc -Wall -Wextra -g -c greet.c
gcc -Wall -Wextra -g main.o greet.o -o app
```

The third run rebuilt `greet.o` and relinked, and left `main.o` alone.

## Common mistakes

- **Spaces where a Tab is required.**
- **Putting function definitions in a header.** Include it from two `.c` files and the linker reports a duplicate. Headers hold declarations.
- **Leaving a header out of the dependencies.** You change the header, and `make` does not rebuild the files that use it.
- **Forgetting to include your own header** in the matching `.c` file, so the compiler cannot check that declaration and definition agree.
