---
title: Dynamic programming
summary: When a recursive solution keeps solving the same subproblems, solve each one once and remember the answer.
---

## The problem with plain recursion

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

`fib(40)` takes many seconds. To compute `fib(40)` it computes `fib(39)` and `fib(38)`. But `fib(39)` computes `fib(38)` again, and so on down. The same values are recomputed an astronomical number of times: the running time is exponential.

Yet there are only 41 different subproblems, `fib(0)` to `fib(40)`.

**Dynamic programming** (DP) applies when a problem has:

- **overlapping subproblems**: the same smaller problems come up repeatedly;
- **optimal substructure**: the best answer to the whole is built from the best answers to its parts.

## Top-down: memoisation

Keep the recursion, and store each answer the first time it is computed.

```python
def fib(n, memo={}):
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]
```

Now each subproblem is solved once: O(n). In Python, `functools.lru_cache` does the storing for you:

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
```

## Bottom-up: tabulation

Fill a table from the smallest subproblem upwards, with a loop and no recursion.

```python
def fib(n):
    if n < 2:
        return n
    table = [0] * (n + 1)
    table[1] = 1
    for i in range(2, n + 1):
        table[i] = table[i - 1] + table[i - 2]
    return table[n]
```

Bottom-up avoids the recursion depth limit and is usually faster. Top-down is often easier to write first.

## A recipe

1. **Define the state.** What does `dp[i]` mean, in one sentence? This is the hard step.
2. **Find the recurrence.** How does `dp[i]` follow from smaller states?
3. **Set the base cases.**
4. **Choose the order** so that everything a state needs is computed before it.
5. **Read off the answer.**

## Example: fewest coins

Given coin values and an amount, what is the smallest number of coins that adds up to it?

Taking the largest coin first fails: with coins 1, 3, 4 and amount 6, that gives 4 + 1 + 1, three coins, while 3 + 3 needs two.

- **State:** `dp[a]` is the fewest coins needed to make amount `a`.
- **Recurrence:** the last coin used is some coin `c`. Before it, the amount was `a - c`. Try every coin: `dp[a] = 1 + min(dp[a - c])`.
- **Base case:** `dp[0] = 0`.
- **Order:** increasing `a`.

```python
def min_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1
```

Time O(amount × number of coins).

## Example: longest common subsequence

A **subsequence** keeps some characters of a string, in their original order, not necessarily next to each other. The longest common subsequence (LCS) of `ABCBDAB` and `BDCABA` has length 4, for example `BCBA`. This is the core of `diff` tools.

- **State:** `dp[i][j]` is the LCS length of the first `i` characters of `a` and the first `j` characters of `b`.
- **Recurrence:** if the last characters match, `a[i-1] == b[j-1]`, they extend the LCS of the two shorter prefixes: `dp[i-1][j-1] + 1`. Otherwise drop one character from either string and take the better: `max(dp[i-1][j], dp[i][j-1])`.
- **Base case:** an empty prefix gives 0, so row 0 and column 0 are zero.

```python
def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[len(a)][len(b)]
```

Time and space O(len(a) × len(b)).

## Example: 0/1 knapsack

Items have a weight and a value. Each can be taken at most once. Maximise the total value within a weight limit.

`dp[w]` is the best value achievable with capacity `w`. Process the items one at a time, and go through the capacities **downwards**, so that each item is counted at most once:

```python
def knapsack(items, capacity):
    dp = [0] * (capacity + 1)
    for weight, value in items:
        for w in range(capacity, weight - 1, -1):
            dp[w] = max(dp[w], dp[w - weight] + value)
    return dp[capacity]
```

## Recognising a DP problem

- It asks for a **count** of ways, or a **minimum** or **maximum**, not for the list of all solutions.
- A decision now changes what is possible later.
- A brute-force recursion would call itself with the same arguments many times.

## Common mistakes

- **A vague state.** If you cannot say in one sentence what `dp[i]` means, the recurrence will not work out.
- **Wrong order**, reading a cell before it has been filled.
- **Off-by-one between string indexes and table indexes.** `dp[i]` covers the first `i` characters, the last of which is `a[i - 1]`.
- **Greedy where DP is needed**, as with the coins above.
