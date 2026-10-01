---
title: Functions
summary: Give a piece of code a name, inputs and a result, so you can use it again and test it on its own.
---

## Defining a function

```c
int square(int x) {
    return x * x;
}
```

- `int` before the name is the **return type**: the kind of value the function gives back.
- `square` is the name.
- `int x` is a **parameter**: an input, with its type.
- `return` hands a value back and ends the function.

Calling it:

```c
int area = square(5);            // 25
printf("%d\n", square(3) + 1);   // 10
```

A function that returns nothing has the return type `void`:

```c
void greet(int times) {
    for (int i = 0; i < times; i++) {
        printf("hello\n");
    }
}
```

## Declare before use

The compiler reads a file from top to bottom. It must have seen a function before the line that calls it. Either define the function above the call, or put a **prototype** at the top: the first line of the function followed by a semicolon.

```c
#include <stdio.h>

int square(int x);        // prototype: a promise that this exists

int main(void) {
    printf("%d\n", square(4));
    return 0;
}

int square(int x) {       // definition
    return x * x;
}
```

## Arguments are copies

When you call a function, each parameter receives a **copy** of the value you passed. Changing the copy does not change the original.

```c
void add_one(int n) {
    n = n + 1;            // changes the copy only
}

int main(void) {
    int a = 5;
    add_one(a);
    printf("%d\n", a);    // still 5
    return 0;
}
```

This is called **pass by value**. To let a function change the caller's variable you pass its address, which is what [pointers](c/07-pointers) are for.

## Scope

A variable exists only inside the braces where it was declared. Two functions can each have a variable named `i`. They are unrelated.

```c
int twice(int x) {
    int result = x * 2;   // exists only inside twice
    return result;
}
```

Variables declared outside every function are **global**: visible everywhere. Avoid them. Any function can change one, which makes bugs hard to trace.

## Recursion

A function may call itself. Every recursive function needs two parts:

- a **base case** that returns without calling itself again;
- a **recursive case** that moves closer to the base case.

```c
long factorial(int n) {
    if (n <= 1) {
        return 1;                       // base case
    }
    return n * factorial(n - 1);        // recursive case
}
```

`factorial(4)` becomes `4 * factorial(3)`, then `4 * 3 * factorial(2)`, and so on down to 1. Without the base case the calls never stop and the program crashes with a stack overflow.

## Why bother with functions

- **Reuse.** Write it once, call it from many places.
- **Names.** `is_prime(n)` says what a block of loops does.
- **Testing.** A small function with clear inputs and one output can be checked on its own. The exercises from here on test your functions directly.

Keep each function short and focused on one job.

## Common mistakes

- **No `return` on some path.** A non-`void` function must return a value however it ends. `-Wall` reports this.
- **Expecting a function to change its argument.** It received a copy.
- **A prototype that does not match the definition**: different types, or a different number of parameters.
- **Printing when you should return.** If the task says a function *returns* a value, use `return`. The caller decides what to do with it.
