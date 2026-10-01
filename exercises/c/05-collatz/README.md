# Collatz steps

Start with a positive whole number `n` and repeat:

- if `n` is even, halve it;
- if `n` is odd, replace it with `3 * n + 1`.

Read `n` and print how many steps it takes to reach 1.

```console
$ echo 6 | ./collatz
8
```

That is 6, 3, 10, 5, 16, 8, 4, 2, 1: eight steps. For `n = 1` the answer is 0.

The values along the way can become much larger than the starting number, so use a `long`.
