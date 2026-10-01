---
title: Binary search
summary: Halve the search space at every step. Simple in idea, famously easy to get subtly wrong.
---

## The idea

To find a word in a dictionary you open it in the middle, see whether your word comes before or after, and discard half the book. Repeat on what remains.

For a **sorted** array of a million elements that takes about 20 steps: O(log n).

## The basic version

```python
def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

`lo` and `hi` mark the range that could still contain the target, both ends included. Each round removes the middle and one half. When `lo` passes `hi` the range is empty.

In C and Java write `mid = lo + (hi - lo) / 2`. The form `(lo + hi) / 2` can overflow when both are large.

## First position: lower bound

With duplicates, the basic version returns *some* matching index. Usually you want the **first** one. More generally: the first index whose value is **greater than or equal to** the target. That is called the **lower bound**, and it is the version worth memorising.

```python
def lower_bound(a, target):
    lo, hi = 0, len(a)            # hi is one past the end
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1          # mid is too small: the answer is to the right
        else:
            hi = mid              # mid could be the answer: keep it
    return lo
```

Here the range is `[lo, hi)`, with `hi` excluded. The loop ends when `lo == hi`, and that index is the answer. If every element is smaller, the result is `len(a)`.

To test whether the target is present: `i = lower_bound(a, t)`, then check `i < len(a) and a[i] == t`.

Python has this built in as `bisect.bisect_left`.

## Getting it right

Binary search bugs are almost always off-by-one errors or infinite loops. Three checks:

1. **What does the range mean?** Decide whether `hi` is included, and keep it consistent.
2. **Does the range shrink every round?** With `lo < hi` and `mid` rounded down, `lo = mid + 1` and `hi = mid` both shrink it. `lo = mid` would loop for ever when `hi = lo + 1`.
3. **Test the edges:** an empty array, one element, target smaller than everything, larger than everything, and duplicates.

## Binary search on the answer

Binary search is not only for arrays. It works on any question where the answers go **no, no, no, yes, yes, yes** as a number increases. You search for the first yes.

**Problem:** packages with given weights must be shipped, in order, within `days` days. Each day the ship carries packages up to its capacity. What is the smallest capacity that works?

- If a capacity works, every larger capacity works too. That is the no/yes pattern.
- Checking one capacity is easy: load greedily and count the days.
- The answer lies between the heaviest package and the sum of all packages.

```python
def days_needed(weights, capacity):
    days = 1
    load = 0
    for w in weights:
        if load + w > capacity:
            days += 1
            load = 0
        load += w
    return days

def min_capacity(weights, days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(weights, mid) <= days:
            hi = mid              # works: try smaller
        else:
            lo = mid + 1          # too small
    return lo
```

It is the lower bound loop again, with a function call in place of an array read. The cost is O(n log S), where S is the sum of the weights.

Whenever a problem says "find the minimum value such that ..." or "the maximum value such that ...", ask whether you can cheaply **check** a given value. If you can, and the check is monotonic, binary search on the answer.

## Common mistakes

- **Searching unsorted data.** The result is meaningless.
- **Mixing the two conventions**: `hi = len(a)` with `lo <= hi`, or `hi = len(a) - 1` with `hi = mid`.
- **`lo = mid` with rounding down**, which never ends.
- **Returning any match** when the first or last was required.
