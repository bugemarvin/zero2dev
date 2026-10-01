---
title: Types and variables
summary: Store numbers and characters, do arithmetic, and read input and print output with the right format.
---

## Variables have a type

A variable is a named place in memory. In C you must say what kind of value it holds, and that cannot change later.

```c
int age = 30;          // whole number
double price = 4.75;   // number with a fraction
char grade = 'A';      // one character, in single quotes
```

| Type | Holds | Typical size | `printf` format |
| --- | --- | --- | --- |
| `int` | whole numbers, about ±2 billion | 4 bytes | `%d` |
| `long` | larger whole numbers | 8 bytes | `%ld` |
| `double` | numbers with fractions | 8 bytes | `%f` |
| `char` | one character | 1 byte | `%c` |

A variable declared with no value holds **garbage**: whatever bits were in that memory before. Always give a starting value.

```c
int total;      // garbage until assigned
int count = 0;  // safe
```

## Printing values

`printf` replaces each `%` code with the next argument:

```c
int age = 30;
double price = 4.75;
printf("Age: %d\n", age);
printf("Price: %.2f\n", price);
printf("%d items cost %.2f\n", 3, 3 * price);
```

```text
Age: 30
Price: 4.75
3 items cost 14.25
```

`%.2f` means two digits after the decimal point. The format code must match the type. Printing a `double` with `%d` prints nonsense.

## Reading input

`scanf` reads from standard input into variables. It needs to know **where** to store the value, which is what `&` (address of) provides. You will meet `&` properly in the [pointers](c/07-pointers) lesson.

```c
int width, height;
scanf("%d %d", &width, &height);
```

For `double`, `scanf` uses `%lf`, which differs from `printf`'s `%f`:

```c
double x;
scanf("%lf", &x);
```

`scanf` returns how many values it managed to read. Checking that tells you whether the input was valid:

```c
if (scanf("%d", &width) != 1) {
    printf("That is not a number\n");
    return 1;
}
```

## Arithmetic

| Operator | Meaning |
| --- | --- |
| `+` `-` `*` | add, subtract, multiply |
| `/` | divide |
| `%` | remainder after whole-number division |

**Dividing two whole numbers gives a whole number.** The fraction is thrown away:

```c
printf("%d\n", 7 / 2);     // 3
printf("%d\n", 7 % 2);     // 1
printf("%f\n", 7 / 2.0);   // 3.500000
```

If either side is a `double`, the result is a `double`. To force that with two `int` variables, convert one. This is called a **cast**:

```c
int sum = 7, count = 2;
double average = (double)sum / count;   // 3.5
```

## Shortcuts

```c
count = count + 1;   // the long way
count += 1;          // same
count++;             // same
total *= 2;          // total = total * 2
```

## Constants

A value that must never change gets `const`. Names in capitals are the convention.

```c
const double PI = 3.14159265;
```

## Overflow

An `int` has a fixed size. Going past its largest value is **undefined behaviour**: the C standard makes no promise about what happens. For values that may exceed about 2 billion, use `long`.

## Common mistakes

- **Forgetting `&` in `scanf`.** The program crashes or stores the value somewhere random.
- **Whole-number division** when you wanted a fraction: `1 / 2` is `0`.
- **The wrong format code**, like `%d` for a `double`.
- **Single and double quotes.** `'A'` is one `char`. `"A"` is a string, which is a different type.
