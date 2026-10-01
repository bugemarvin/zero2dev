---
title: Arrays
summary: Hold many values of the same type side by side, and pass them to functions.
---

## Declaring and using

An array is a row of values of one type, stored next to each other in memory.

```c
int scores[5] = {90, 72, 85, 60, 77};
```

Each value has an **index**, starting from **0**:

```text
index:    0    1    2    3    4
value:   90   72   85   60   77
```

```c
printf("%d\n", scores[0]);   // 90, the first
printf("%d\n", scores[4]);   // 77, the last
scores[1] = 75;              // change the second
```

An array of size `n` has indexes `0` to `n - 1`. There is no `scores[5]`.

Other ways to create one:

```c
int counts[10] = {0};        // all ten set to 0
int primes[] = {2, 3, 5, 7}; // size worked out from the values: 4
int raw[100];                // garbage until you fill it
```

## Looping over an array

```c
int total = 0;
for (int i = 0; i < 5; i++) {
    total += scores[i];
}
```

This is why loops count from 0 with `<`. The same `i` is both the round number and a valid index.

## Arrays do not know their length

An array carries no record of its size. The compiler can work it out, but only in the same scope where the array was declared:

```c
int n = sizeof(scores) / sizeof(scores[0]);   // 5
```

`sizeof(scores)` is the total number of bytes, and `sizeof(scores[0])` is the bytes in one element.

## Passing an array to a function

When you pass an array, the function receives the **location of the first element**, not a copy of the values. Two things follow.

**1. The function cannot tell how long the array is.** You must pass the length as a separate argument.

```c
int sum(const int a[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += a[i];
    }
    return total;
}
```

**2. Changes the function makes are visible to the caller.** That is the opposite of plain `int` parameters.

```c
void double_all(int a[], int n) {
    for (int i = 0; i < n; i++) {
        a[i] *= 2;
    }
}
```

`const` in the first example is a promise that the function will not modify the array. The compiler enforces it. Use it whenever the function only reads.

## Out of bounds

C does **not** check that an index is valid. Reading `scores[5]` reads whatever memory happens to sit after the array. Writing to it overwrites that memory.

```c
int a[3] = {1, 2, 3};
a[3] = 99;   // undefined behaviour: writes past the end
```

The program may crash, print wrong answers, or seem to work and fail later. This single mistake is behind a large share of all security bugs in C programs.

The checker builds your code with **AddressSanitizer**, which catches it at the moment it happens:

```text
ERROR: AddressSanitizer: stack-buffer-overflow
WRITE of size 4
    #0 in main example.c:3
```

Use the same flags when you compile by hand:

```console
$ gcc -Wall -Wextra -g -fsanitize=address,undefined example.c -o example
```

## Two dimensions

```c
int grid[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
printf("%d\n", grid[1][2]);   // 6: row 1, column 2
```

## Common mistakes

- **Using index `n`** on an array of size `n`. The last valid index is `n - 1`.
- **`i <= n` in the loop**, which reaches one element too far.
- **Calling `sizeof` on an array parameter.** Inside the function it gives the size of an address, not of the array.
- **Returning a local array from a function.** Its memory is released when the function ends. The [memory](c/08-memory) lesson shows the correct way.
