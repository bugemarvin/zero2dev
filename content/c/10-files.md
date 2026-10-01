---
title: Files and command-line arguments
summary: Read and write files, take arguments from the command line, and report errors properly.
---

## Command-line arguments

`main` can receive the words typed after the program name:

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("%d arguments\n", argc);
    for (int i = 0; i < argc; i++) {
        printf("argv[%d] = %s\n", i, argv[i]);
    }
    return 0;
}
```

```console
$ ./args notes.txt 3
3 arguments
argv[0] = ./args
argv[1] = notes.txt
argv[2] = 3
```

- `argc` is the count. It includes the program name, so it is at least 1.
- `argv` is an array of strings. `argv[0]` is the program name, and your real arguments start at `argv[1]`.

Arguments are always strings. Convert with `atoi(argv[2])` for an `int` or `atof` for a `double`, both from `<stdlib.h>`.

Always check `argc` before using `argv[1]`:

```c
if (argc != 2) {
    fprintf(stderr, "usage: %s FILE\n", argv[0]);
    return 1;
}
```

## Opening and closing

```c
FILE *f = fopen("notes.txt", "r");
if (f == NULL) {
    fprintf(stderr, "cannot open notes.txt\n");
    return 1;
}

/* ... use the file ... */

fclose(f);
```

| Mode | Meaning |
| --- | --- |
| `"r"` | read. The file must exist. |
| `"w"` | write. Creates the file, or **empties** it if it exists. |
| `"a"` | append. Writes go to the end. |

`fopen` returns `NULL` when it fails: no such file, no permission. **Always check.** Using a `NULL` file pointer crashes.

Every successful `fopen` needs an `fclose`. Closing also makes sure buffered output is really written to disk.

## Reading

Line by line, which suits most text:

```c
char line[256];
while (fgets(line, sizeof(line), f) != NULL) {
    printf("%s", line);
}
```

Character by character. `fgetc` returns an `int`, because it has to be able to return the special value `EOF` at the end of the file:

```c
int c;
while ((c = fgetc(f)) != EOF) {
    putchar(c);
}
```

Formatted, like `scanf`:

```c
int n;
while (fscanf(f, "%d", &n) == 1) {
    printf("read %d\n", n);
}
```

## Writing

```c
FILE *out = fopen("report.txt", "w");
if (out == NULL) {
    return 1;
}
fprintf(out, "Total: %d\n", total);
fclose(out);
```

`fprintf` is `printf` with a file as its first argument. In fact `printf(...)` is `fprintf(stdout, ...)`.

## The three standard streams

Three files are open before `main` starts: `stdin`, `stdout` and `stderr`. Send error messages to `stderr`:

```c
fprintf(stderr, "error: file is empty\n");
```

That keeps them out of the normal output, so a user who redirects output to a file still sees them. Combine it with a non-zero return from `main`, and other programs and scripts can tell that yours failed.

## A complete example

Count the lines in a file given on the command line:

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s FILE\n", argv[0]);
        return 1;
    }
    FILE *f = fopen(argv[1], "r");
    if (f == NULL) {
        fprintf(stderr, "cannot open %s\n", argv[1]);
        return 1;
    }
    int lines = 0;
    int c;
    while ((c = fgetc(f)) != EOF) {
        if (c == '\n') {
            lines++;
        }
    }
    fclose(f);
    printf("%d\n", lines);
    return 0;
}
```

## Common mistakes

- **Not checking `fopen` for `NULL`.**
- **Storing `fgetc`'s result in a `char`.** The comparison with `EOF` then goes wrong. Use `int`.
- **Opening with `"w"` to read.** The file is emptied.
- **Forgetting `fclose`**, which can lose the last part of what you wrote.
