---
title: Big-O and how to measure code
summary: A way to say how the running time of code grows as its input grows, without a stopwatch.
---

## Why counting seconds does not work

The same program is fast on a new laptop and slow on an old phone. Timing tells you about the machine. What you need is a way to describe the **algorithm**: how does the amount of work grow when the input gets bigger?

That is what Big-O notation describes. `n` stands for the size of the input, for example the length of a list.

## Counting steps

```python
def contains(items, target):
    for item in items:
        if item == target:
            return True
    return False
```

In the worst case, when the target is absent, the loop looks at all `n` items. Double the list and the work doubles. This is **O(n)**, read "order n", or *linear time*.

```python
def has_duplicate(items):
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False
```

Here every item is compared with every later item: about `n * n / 2` comparisons. Double the list and the work is multiplied by four. This is **O(n²)**, *quadratic time*.

## The rules

1. **Keep the fastest-growing term.** `n² + 5n + 20` is O(n²). For large `n` the other terms do not matter.
2. **Drop constant factors.** `3n` and `n / 2` are both O(n).
3. **Think of the worst case**, unless stated otherwise.

## The common classes

From fastest to slowest:

| Big-O | Name | Example | Steps for n = 1,000,000 |
| --- | --- | --- | --- |
| O(1) | constant | read `a[i]`, dictionary lookup | 1 |
| O(log n) | logarithmic | binary search | about 20 |
| O(n) | linear | one loop over the input | 1,000,000 |
| O(n log n) | linearithmic | good sorting algorithms | about 20,000,000 |
| O(n²) | quadratic | two nested loops | 1,000,000,000,000 |
| O(2ⁿ) | exponential | trying every subset | more than atoms in the universe |

A computer does very roughly 100 million simple steps per second in a fast language, and perhaps 10 million in Python. So for a million items, O(n log n) takes a moment and O(n²) takes hours.

That gap is why this subject exists. A better algorithm beats a faster computer.

## Logarithms in one paragraph

`log n` here means: how many times can you halve `n` before reaching 1? For 1,000,000 the answer is about 20. Any algorithm that throws away half of the remaining work at each step is O(log n).

## Reading the complexity off the code

| Shape | Complexity |
| --- | --- |
| a fixed number of statements | O(1) |
| one loop over the input | O(n) |
| a loop inside a loop, both over the input | O(n²) |
| a loop that halves the range each round | O(log n) |
| a loop over the input, with a halving loop inside | O(n log n) |
| two loops one after the other | O(n + n), which is O(n) |

Watch for hidden loops. In Python `x in some_list` and `some_list.index(x)` each scan the list, so they are O(n). The same test on a `set` or `dict` is O(1). Putting `in some_list` inside a loop quietly gives O(n²).

## Space

The same notation describes **memory**. A function that builds a new list of `n` items uses O(n) extra space. One that only keeps a few variables uses O(1). Often you can trade one for the other: spend memory on a dictionary to save time.

## Using it to choose

The limits of a problem tell you which complexity you can afford. As a rule of thumb for a time limit of a few seconds:

| Input size n | What will be fast enough |
| --- | --- |
| up to 20 | O(2ⁿ) |
| up to 5,000 | O(n²) |
| up to 1,000,000 | O(n log n) or O(n) |
| larger | O(n) or O(log n) |

## About the exercises in this track

Every exercise here is defined by **input and output**. Your program reads from standard input and prints to standard output, so you can write it in any language you have installed.

Each exercise ships with a Python starter that already reads the input. In the app, choose another language in the **Language** box above the editor. In a terminal:

```console
$ python3 check.py start dsa/01-max-of-list --lang java
$ python3 check.py dsa/01-max-of-list --lang java
```

Some exercises include a large test that a slow algorithm will not finish in time. When a test reports a timeout, the answer is a better algorithm, not a faster machine.

## Common mistakes

- **Counting lines of code.** One line can hide a loop, like `sum(a)` or `sorted(a)`.
- **Keeping constants.** O(2n) is written O(n).
- **Optimising before measuring.** For 100 items, anything works. Use the simple version until the input size says otherwise.
