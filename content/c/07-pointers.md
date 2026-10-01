---
title: Pointers
summary: A pointer holds the address of another variable. It is how C shares and changes data across functions.
---

## Memory has addresses

Picture memory as a very long row of numbered boxes. Every variable lives in some of those boxes, and the number of its first box is its **address**.

`&x` gives the address of `x`:

```c
int x = 42;
printf("%d\n", x);            // 42
printf("%p\n", (void *)&x);   // something like 0x7ffd3c1a5b2c
```

## A pointer stores an address

```c
int x = 42;
int *p = &x;
```

Read `int *p` as "`p` is a pointer to an `int`". Now `p` holds the address of `x`. We say `p` **points to** `x`.

```text
   x                 p
+------+         +--------+
|  42  | <------ | &x     |
+------+         +--------+
```

## Following a pointer

`*p` means "the value at the address stored in `p`". This is called **dereferencing**.

```c
printf("%d\n", *p);   // 42: read x through p
*p = 7;               // write to x through p
printf("%d\n", x);    // 7
```

The star has two jobs, which confuses everyone at first:

| Where | Meaning |
| --- | --- |
| in a declaration: `int *p;` | `p` is a pointer |
| in an expression: `*p = 7;` | go to where `p` points |

## Why pointers exist

Functions receive **copies** of their arguments. So this cannot work:

```c
void swap(int a, int b) {
    int tmp = a;
    a = b;
    b = tmp;      // swaps the copies and changes nothing outside
}
```

Pass addresses instead, and the function can reach the caller's variables:

```c
void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("%d %d\n", x, y);   // 2 1
    return 0;
}
```

This is also why `scanf` needs `&`: it must know where to put the value it reads.

A second use is returning more than one result. The function writes each result through a pointer:

```c
void divide(int a, int b, int *quotient, int *remainder) {
    *quotient = a / b;
    *remainder = a % b;
}
```

## NULL

A pointer that points nowhere should hold the special value `NULL`. Dereferencing `NULL` crashes the program at once with a segmentation fault. That is useful: the bug shows itself immediately, at the line that caused it.

```c
int *p = NULL;
if (p != NULL) {
    printf("%d\n", *p);
}
```

A pointer that was never given a value holds a garbage address. Dereferencing it is undefined behaviour. Initialise every pointer, to a real address or to `NULL`.

## Pointers and arrays

The name of an array, used in an expression, becomes a pointer to its first element. That is what really happens when you pass an array to a function. These two declarations mean the same thing:

```c
int sum(const int a[], int n);
int sum(const int *a, int n);
```

Adding 1 to a pointer moves it forward by **one element**, whatever the element's size:

```c
int a[] = {10, 20, 30};
int *p = a;                // points at a[0]
printf("%d\n", *p);        // 10
printf("%d\n", *(p + 1));  // 20
printf("%d\n", p[2]);      // 30
```

`p[i]` and `*(p + i)` are the same operation. Indexing is pointer arithmetic with a nicer spelling.

A function can return a pointer into an array it was given, for example to the element it found, or `NULL` when nothing was found.

## const with pointers

```c
const int *p;   // cannot change the value p points to
```

Put `const` on pointer parameters that are only read. It documents the function and lets the compiler catch accidental writes.

## Common mistakes

- **Dereferencing an uninitialised or `NULL` pointer.** Segmentation fault.
- **Returning the address of a local variable.** The variable is gone when the function returns, and the pointer is left **dangling**.
- **Mixing up `p` and `*p`.** `p = 7` changes where the pointer points. `*p = 7` changes the value there.
- **`int* a, b;`** declares one pointer and one plain `int`. Declare one variable per line.
