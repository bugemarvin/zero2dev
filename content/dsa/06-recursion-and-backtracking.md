---
title: Recursion and backtracking
summary: Solve a problem by solving smaller copies of it, and explore every possibility in an organised way.
---

## Thinking recursively

A recursive function solves a problem by calling itself on a smaller version of the same problem. Two parts are always there:

- a **base case**: an input small enough to answer directly;
- a **recursive case**: reduce the problem, call yourself, and build the answer from the result.

```python
def total(items):
    if not items:                        # base case
        return 0
    return items[0] + total(items[1:])   # first element + total of the rest
```

The skill is to **trust the recursive call**. Assume `total(items[1:])` already works. Then the only question is how to finish the job from there.

## The call stack

Each call gets its own frame of local variables on the call stack. `total([1, 2, 3])` waits for `total([2, 3])`, which waits for `total([3])`, which waits for `total([])`. The base case returns 0, and the answers flow back up: 3, then 5, then 6.

The depth is limited. Python stops at about 1,000 nested calls with a `RecursionError`. In C a very deep recursion crashes with a stack overflow. Recursion that goes `n` levels deep is fine for a tree of a million nodes, where the depth is about 20, and risky for a list of a million items.

## Divide and conquer

Splitting the problem in **half** keeps the depth at O(log n). Fast exponentiation computes `x` to the power `n` with about log n multiplications:

```python
def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    if n % 2 == 0:
        return half * half
    return half * half * x
```

[Merge sort](dsa/07-sorting) and [binary search](dsa/08-binary-search) have the same shape.

## Backtracking

Some problems have no shortcut: you must try the possibilities. **Backtracking** builds a candidate one choice at a time. At each step it tries every option in turn. When a partial candidate cannot lead anywhere, it undoes the last choice and tries the next.

The template:

```python
def solve(partial):
    if is_complete(partial):
        record(partial)
        return
    for choice in options(partial):
        make(choice)
        solve(partial)
        undo(choice)          # backtrack
```

## Example: all permutations

Every ordering of `1..n`. At each position, try every number not yet used.

```python
def permutations(n):
    result = []
    current = []
    used = [False] * (n + 1)

    def build():
        if len(current) == n:
            result.append(current.copy())
            return
        for value in range(1, n + 1):
            if not used[value]:
                used[value] = True
                current.append(value)
                build()
                current.pop()          # undo
                used[value] = False

    build()
    return result
```

Trying the values in increasing order produces the permutations in dictionary order. `current.copy()` matters: without it every entry in `result` would be the same list, which ends up empty.

There are `n!` permutations, so this is only practical for small `n`. 10! is already 3.6 million.

## Example: all subsets

For each element there are two choices, leave it out or take it. That gives 2ⁿ subsets.

```python
def subsets(items):
    result = []
    current = []

    def build(i):
        if i == len(items):
            result.append(current.copy())
            return
        build(i + 1)                   # without items[i]
        current.append(items[i])
        build(i + 1)                   # with items[i]
        current.pop()

    build(0)
    return result
```

## Pruning

The power of backtracking is in **stopping early**. If a partial candidate already breaks a rule, none of its extensions needs to be tried.

**N queens:** place `n` queens on an `n` by `n` board so that no two attack each other. Place one queen per row. Before placing, check the column and both diagonals. A conflict cuts off that whole branch.

```python
def count_queens(n):
    columns = set()
    diag1 = set()       # row - col is the same along one diagonal direction
    diag2 = set()       # row + col is the same along the other

    def place(row):
        if row == n:
            return 1
        count = 0
        for col in range(n):
            if col in columns or (row - col) in diag1 or (row + col) in diag2:
                continue                      # pruned
            columns.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            count += place(row + 1)
            columns.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)
        return count

    return place(0)
```

Without pruning, 8 queens means checking 16 million arrangements. With it, a few thousand.

## Common mistakes

- **No base case, or one that is never reached.** The recursion never ends.
- **Forgetting to undo** a choice. Later branches then see leftover state.
- **Storing the working list without copying it.**
- **Recomputing the same subproblem again and again.** That is the cue for [dynamic programming](dsa/13-dynamic-programming).
