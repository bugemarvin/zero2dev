---
title: Strings
summary: In C a string is an array of characters with a zero at the end. Everything about strings follows from that.
---

## What a string is

C has no string type. A string is a `char` array whose text is followed by a special character with the value 0, written `'\0'` and called the **null terminator**.

```c
char name[] = "Sam";
```

```text
index:   0     1     2     3
value:  'S'   'a'   'm'   '\0'
```

The array has **4** elements for a 3-letter word. Every function that works on strings walks forward until it meets `'\0'`. If the terminator is missing, the function keeps reading past the end of the array.

## Characters are numbers

A `char` is a small whole number. The value is the character's code in the ASCII table: `'A'` is 65, `'a'` is 97, `'0'` is 48.

```c
char c = 'A';
printf("%c %d\n", c, c);     // A 65
printf("%c\n", c + 1);       // B
```

Letters are in order, so you can compare them and do arithmetic:

```c
if (c >= 'a' && c <= 'z') {
    c = c - 'a' + 'A';       // to upper case
}
```

The header `<ctype.h>` has ready-made helpers: `isalpha`, `isdigit`, `isspace`, `toupper`, `tolower`.

## Walking through a string

The loop stops at the terminator, so no length is needed:

```c
int count_spaces(const char s[]) {
    int count = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] == ' ') {
            count++;
        }
    }
    return count;
}
```

## Library functions

They live in `<string.h>`.

| Function | What it does |
| --- | --- |
| `strlen(s)` | number of characters before the terminator |
| `strcmp(a, b)` | 0 if equal, negative or positive otherwise |
| `strcpy(dest, src)` | copy `src` into `dest` |
| `strcat(dest, src)` | add `src` to the end of `dest` |
| `strchr(s, c)` | find the first `c` in `s` |

**You cannot compare strings with `==`.** That compares where the two arrays are in memory, not their contents. Use `strcmp`:

```c
if (strcmp(answer, "yes") == 0) {
    printf("confirmed\n");
}
```

## Printing and reading

```c
char name[] = "Sam";
printf("Hello, %s\n", name);
```

To read a whole line safely, use `fgets`. You tell it the size of your buffer, and it never writes more than that:

```c
char line[100];
if (fgets(line, sizeof(line), stdin) != NULL) {
    printf("You typed: %s", line);
}
```

`fgets` keeps the newline that ended the line. A common way to remove it:

```c
line[strcspn(line, "\n")] = '\0';
```

## Room for the terminator

`strcpy` and `strcat` do not check that the destination is big enough. That is your job.

```c
char small[4];
strcpy(small, "hello");   // writes 6 bytes into 4: buffer overflow
```

A buffer for a string of length `n` needs `n + 1` bytes.

## String literals are read-only

Text in double quotes written directly in the code must not be modified:

```c
char *fixed = "hello";     // points at read-only text
char mine[] = "hello";     // a copy in your own array, safe to change
mine[0] = 'J';             // fine
```

## Common mistakes

- **Forgetting space for `'\0'`.**
- **Comparing with `==`** in place of `strcmp`.
- **Using `scanf("%s", ...)` or `gets`** with no size limit. A long input overflows the buffer. Use `fgets`.
- **Building a string by hand and not adding the terminator** at the end.
