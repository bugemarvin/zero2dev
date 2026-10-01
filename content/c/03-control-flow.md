---
title: Control flow
summary: Make decisions with if and switch, and repeat work with while and for.
---

## Conditions

A condition is an expression that is true or false.

| Operator | Meaning |
| --- | --- |
| `==` | equal |
| `!=` | not equal |
| `<` `<=` `>` `>=` | comparisons |
| `&&` | and: both sides true |
| `\|\|` | or: at least one side true |
| `!` | not |

C has no separate true and false values underneath. **Zero is false, anything else is true.**

## if

```c
if (score >= 90) {
    printf("excellent\n");
} else if (score >= 50) {
    printf("pass\n");
} else {
    printf("fail\n");
}
```

The branches are tested from the top, and only the first one that matches runs.

Always use braces, even for one line. Without them only the next single statement belongs to the `if`, which leads to bugs when you add a second line later.

## while

Repeats as long as the condition is true. The condition is checked before each round.

```c
int n = 3;
while (n > 0) {
    printf("%d\n", n);
    n--;
}
printf("lift off\n");
```

```text
3
2
1
lift off
```

Something inside the loop must eventually make the condition false. Otherwise it runs forever. `Ctrl+C` stops a program stuck in a loop.

A common pattern is to read until the input ends:

```c
int x;
while (scanf("%d", &x) == 1) {
    printf("got %d\n", x);
}
```

## for

When you know how many times to repeat, `for` puts the three parts of a counting loop on one line:

```c
for (int i = 0; i < 5; i++) {
    printf("%d ", i);
}
```

```text
0 1 2 3 4
```

1. `int i = 0` runs once, at the start.
2. `i < 5` is checked before each round.
3. `i++` runs after each round.

Counting from 0 up to, and not including, `n` is the standard shape in C. It gives exactly `n` rounds and matches how arrays are numbered.

## break and continue

- `break` leaves the loop immediately.
- `continue` skips the rest of this round and starts the next.

```c
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue;       // skip even numbers
    }
    if (i > 7) {
        break;          // stop completely
    }
    printf("%d ", i);   // prints 1 3 5 7
}
```

## switch

`switch` picks a branch by comparing one whole-number or character value against constants:

```c
switch (grade) {
    case 'A':
        printf("great\n");
        break;
    case 'B':
    case 'C':
        printf("fine\n");
        break;
    default:
        printf("unknown\n");
}
```

Each case needs its own `break`. Without it, execution **falls through** into the next case. Stacking labels, as with `'B'` and `'C'` above, is the one deliberate use of that.

## Common mistakes

- **`=` in place of `==`.** `if (x = 5)` assigns 5 to `x` and is always true. `-Wall` warns about it.
- **A semicolon after the condition.** `if (x > 0);` ends the `if` right there, and the block below always runs.
- **Off by one.** `i <= n` runs `n + 1` times when starting from 0. Decide whether the end is included, and test with a small number.
- **A forgotten `break`** in a `switch`.
