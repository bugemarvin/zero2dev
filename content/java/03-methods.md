---
title: Methods
summary: Name a piece of work, give it typed inputs and a typed result, and call it from anywhere.
---

## Defining a method

```java
public class MathUtil {
    static int square(int x) {
        return x * x;
    }
}
```

- `static`: the method belongs to the class, so no object is needed to call it. Instance methods come in the lesson on [classes](java/05-classes-and-objects).
- `int`: the type of the value it returns. `void` means nothing is returned.
- `square`: the name.
- `int x`: a parameter with its type.

Calling it from another class uses the class name:

```java
int area = MathUtil.square(5);     // 25
```

Inside the same class, `square(5)` is enough.

## Every path must return

If the return type is not `void`, the compiler checks that the method returns a value however it ends:

```java
static String sign(int n) {
    if (n > 0) {
        return "positive";
    } else if (n < 0) {
        return "negative";
    }
    return "zero";        // without this line the code does not compile
}
```

## Arguments are passed by value

A method receives **copies** of the values you pass.

```java
static void addOne(int n) {
    n = n + 1;            // changes the copy only
}

int a = 5;
addOne(a);
System.out.println(a);    // still 5
```

For objects and arrays, the value that is copied is the **reference**: where the object is. The method therefore reaches the same object, and can change what is inside it:

```java
static void clearFirst(int[] numbers) {
    numbers[0] = 0;       // the caller's array changes
}
```

It still cannot make the caller's variable refer to a different object.

## Overloading

Several methods may share a name if their parameter lists differ. The compiler picks the one that matches the call.

```java
static int max(int a, int b) {
    return a > b ? a : b;
}

static double max(double a, double b) {
    return a > b ? a : b;
}

static int max(int a, int b, int c) {
    return max(max(a, b), c);
}
```

`condition ? x : y` is the conditional operator: `x` when the condition is true, otherwise `y`.

## Scope

A variable exists only inside the block where it is declared. Parameters and local variables vanish when the method returns. Two methods can use the same variable names without affecting each other.

## Recursion

A method may call itself. It needs a base case that stops, and a recursive case that gets closer to it.

```java
static long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}
```

Returning `long` matters: `13!` no longer fits in an `int`.

## Useful methods you already have

The `Math` class is full of static methods:

```java
Math.max(3, 7)       // 7
Math.abs(-4)         // 4
Math.pow(2, 10)      // 1024.0
Math.sqrt(16)        // 4.0
Math.floorMod(-7, 3) // 2: a remainder that is never negative
```

## Documenting

A `/** ... */` comment above a method is a **Javadoc** comment. Editors show it when you hover over a call.

```java
/** Returns the greatest common divisor of a and b. */
static int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
```

## Common mistakes

- **Missing return on some path.**
- **Forgetting `static`** on a helper called from `main`. The error says a non-static method cannot be referenced from a static context.
- **Expecting a method to change an `int` you passed in.**
- **Printing where a return was asked for.**
- **Recursion with no reachable base case**, which ends in a `StackOverflowError`.
