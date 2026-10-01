---
title: Types and control flow
summary: Variables with fixed types, text, input, and the statements that decide and repeat.
---

## Variables

Every variable has a type, fixed when it is declared.

```java
int count = 10;
double price = 4.75;
boolean ready = true;
char grade = 'A';
String name = "Sam";
```

| Type | Holds | Note |
| --- | --- | --- |
| `int` | whole numbers to about ±2 billion | the usual choice |
| `long` | much larger whole numbers | write literals with `L`: `5000000000L` |
| `double` | numbers with fractions | |
| `boolean` | `true` or `false` | |
| `char` | one character | single quotes |
| `String` | text | double quotes. A class, not a primitive. |

`var` lets the compiler work out the type from the value. The variable is still strictly typed.

```java
var total = 0;          // int
var title = "Dune";     // String
```

`final` makes a variable that cannot be reassigned:

```java
final int MAX_ITEMS = 100;
```

## Arithmetic

```java
7 / 2        // 3     both whole numbers: the fraction is dropped
7 / 2.0      // 3.5
7 % 2        // 1     remainder
(double) 7 / 2   // 3.5   a cast converts first
```

An `int` that goes past its limit **wraps around** silently to a negative number. Use `long` when values can grow large.

## Strings

```java
String s = "Hello";
s.length()            // 5
s.charAt(0)           // 'H'
s.toUpperCase()       // "HELLO"
s.substring(1, 3)     // "el"
s.contains("ell")     // true
s + " there"          // "Hello there"
```

Strings cannot be changed. Each method returns a new one.

**Compare strings with `.equals`, never with `==`.**

```java
String a = "hi";
String b = new String("hi");
a == b            // false: are these the same object?
a.equals(b)       // true:  do they hold the same text?
```

`==` on objects asks whether two variables refer to the very same object. This is the most common beginner bug in Java.

Converting: `Integer.parseInt("42")` gives an `int`, `Double.parseDouble("3.5")` a `double`, and `String.valueOf(42)` gives `"42"`.

## Reading input

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        String word = in.next();
        System.out.println(word + " " + n);
    }
}
```

| Method | Reads |
| --- | --- |
| `nextInt()`, `nextLong()`, `nextDouble()` | the next number |
| `next()` | the next word |
| `nextLine()` | the rest of the current line |
| `hasNextInt()`, `hasNext()` | whether more input is waiting |

To read numbers until the input ends:

```java
while (in.hasNextInt()) {
    int x = in.nextInt();
}
```

## if

```java
if (score >= 90) {
    System.out.println("excellent");
} else if (score >= 50) {
    System.out.println("pass");
} else {
    System.out.println("fail");
}
```

The condition must be a `boolean`. Unlike in C, a number cannot be used as a condition.

Operators: `==`, `!=`, `<`, `<=`, `>`, `>=`, and `&&` (and), `||` (or), `!` (not).

## Loops

```java
for (int i = 0; i < 5; i++) {
    System.out.print(i + " ");       // 0 1 2 3 4
}

int n = 3;
while (n > 0) {
    n--;
}
```

`break` leaves the loop. `continue` skips to the next round.

## switch

The modern form uses arrows, needs no `break`, and can produce a value:

```java
String name = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 6, 7 -> "Weekend";
    default -> "Midweek";
};
```

## Common mistakes

- **`==` on strings.**
- **Whole-number division** when a fraction was wanted.
- **`int` overflow.** Use `long` for big totals and products.
- **Mixing `nextInt()` and `nextLine()`.** After `nextInt()`, the rest of that line, often just the newline, is still waiting. The next `nextLine()` returns it, empty.
- **Using a variable before giving it a value.** The compiler refuses.
