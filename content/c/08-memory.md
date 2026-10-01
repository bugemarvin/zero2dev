---
title: Memory, malloc and free
summary: Ask for memory while the program runs, and give it back. This is where C asks the most of you.
---

## Two kinds of memory

**The stack** holds local variables. Space is taken when a function starts and released when it returns. It is automatic and fast, with two limits: the size must be known in advance, and the data dies with the function.

**The heap** is memory you request by hand. It stays yours until you release it, however many functions come and go.

You need the heap when:

- the size is only known while the program runs;
- data must outlive the function that created it;
- the data is large.

## malloc and free

Both live in `<stdlib.h>`.

```c
#include <stdlib.h>

int *numbers = malloc(n * sizeof(int));
if (numbers == NULL) {
    return 1;                // the system had no memory to give
}

for (int i = 0; i < n; i++) {
    numbers[i] = i * i;
}

free(numbers);
```

- `malloc(bytes)` returns a pointer to a block of that many bytes, or `NULL` if it fails.
- `sizeof(int)` is the size of one `int`, so `n * sizeof(int)` is room for `n` of them.
- The block holds **garbage** until you write to it.
- `free(pointer)` gives the block back.

**Every `malloc` needs exactly one `free`.**

| Function | Use |
| --- | --- |
| `malloc(size)` | a block of `size` bytes, not initialised |
| `calloc(count, size)` | `count` elements, all set to zero |
| `realloc(ptr, size)` | resize a block, keeping its contents |
| `free(ptr)` | release a block |

## Returning memory from a function

A function must not return a pointer to its own local array, because that array vanishes on return. It **can** return heap memory:

```c
int *make_squares(int n) {
    int *a = malloc(n * sizeof(int));
    if (a == NULL) {
        return NULL;
    }
    for (int i = 0; i < n; i++) {
        a[i] = i * i;
    }
    return a;          // the caller must free it
}
```

Whoever ends up holding the pointer is responsible for freeing it. Say so in a comment. This is called **ownership**, and being clear about it prevents most memory bugs.

For a string, remember the terminator: a copy of `s` needs `strlen(s) + 1` bytes.

## Growing a block

`realloc` may have to move the data to a new place. It returns the new address, so assign through a temporary. If it fails, the old block is still valid and must not be lost:

```c
int *bigger = realloc(numbers, new_n * sizeof(int));
if (bigger == NULL) {
    free(numbers);
    return 1;
}
numbers = bigger;
```

## What goes wrong

| Bug | What it is | Result |
| --- | --- | --- |
| **Memory leak** | never calling `free` | memory use grows until the program is killed |
| **Use after free** | reading or writing a block after freeing it | corrupted data, crashes |
| **Double free** | freeing the same block twice | crash, or silent corruption |
| **Buffer overflow** | writing past the end of a block | corrupts whatever is next to it |

None of these is reported by the compiler, and the program often appears to work.

## Let the tools find them

The checker compiles your code with **AddressSanitizer**, which reports all four, with the line that caused it:

```text
ERROR: LeakSanitizer: detected memory leaks
Direct leak of 40 byte(s) in 1 object(s) allocated from:
    #0 in malloc
    #1 in make_squares squares.c:4
```

Read it from the top: 40 bytes were never freed, and they were allocated on line 4 of `squares.c`. Compile with the same flags yourself:

```console
$ gcc -Wall -Wextra -g -fsanitize=address,undefined squares.c -o squares
```

## Habits that prevent these bugs

- Write the `free` at the same moment you write the `malloc`.
- After `free(p)`, set `p = NULL`, so a later mistaken use crashes cleanly.
- Check every `malloc` result for `NULL`.
- Decide who owns each block, and write it down.

## Common mistakes

- **`malloc(n)` for `n` integers.** That is `n` bytes. You need `n * sizeof(int)`.
- **Forgetting `+ 1`** for the terminator when copying a string.
- **Losing the only pointer to a block**, by overwriting it or letting it go out of scope. The block can then never be freed.
- **`sizeof(pointer)`** gives the size of an address, not of the block it points to.
