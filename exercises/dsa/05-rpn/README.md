# Evaluate postfix expressions

In postfix notation an operator comes after its two operands. `3 4 + 2 *` means `(3 + 4) * 2`.

**Input:** the first line holds `t`. Each of the next `t` lines is a valid postfix expression: whole numbers and the operators `+`, `-` and `*`, separated by single spaces. Numbers may be negative, like `-5`.

**Output:** the value of each expression, one per line.

```text
input            output
3                14
3 4 + 2 *        2
5 3 -            -8
2 3 4 * - 2 +
```

Mind the order for `-`: `5 3 -` is `5 - 3`.
