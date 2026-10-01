---
title: Arrays and two pointers
summary: How arrays work underneath, and a technique that turns many O(n²) searches into O(n).
---

## What an array gives you

An array stores its elements side by side in memory. Because every element has the same size, the address of element `i` can be computed directly, so reading or writing `a[i]` is **O(1)** however long the array is.

The price is that the elements must stay packed together:

| Operation | Cost | Why |
| --- | --- | --- |
| read or write `a[i]` | O(1) | the address is computed |
| add or remove at the end | O(1) | nothing else moves |
| insert or remove at the front or middle | O(n) | everything after it shifts |
| search an unsorted array | O(n) | must look at each element |
| search a sorted array | O(log n) | [binary search](dsa/08-binary-search) |

Python's `list`, Java's `ArrayList` and C++'s `vector` are **dynamic arrays**. When they run out of room they allocate a bigger block, usually double the size, and copy everything across. That copy is O(n), but it happens so rarely that adding at the end still costs O(1) on average.

## The two-pointer technique

Many problems ask about pairs of elements. The obvious solution is two nested loops, which is O(n²). When the array is **sorted**, you can often do it in one pass with two indexes moving toward each other.

**Problem:** in a sorted array, find two numbers that add up to a target.

```python
def pair_with_sum(a, target):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        total = a[lo] + a[hi]
        if total == target:
            return a[lo], a[hi]
        if total < target:
            lo += 1        # need a bigger sum: move the left pointer right
        else:
            hi -= 1        # need a smaller sum: move the right pointer left
    return None
```

Why it is correct: if `a[lo] + a[hi]` is too small, then `a[lo]` is too small to pair with **anything** still in range, since `a[hi]` is the largest value left. So `a[lo]` can be discarded for good. The mirror argument applies when the sum is too large.

Each round discards one element, so there are at most `n` rounds: **O(n)** time and O(1) extra space.

## Same direction: slow and fast

Two pointers can also move the same way. A **fast** pointer reads, and a **slow** pointer marks where the next kept element goes. This removes duplicates from a sorted array in place:

```python
def dedupe(a):
    if not a:
        return 0
    slow = 0
    for fast in range(1, len(a)):
        if a[fast] != a[slow]:
            slow += 1
            a[slow] = a[fast]
    return slow + 1        # the number of unique elements
```

## Sliding window

A window is a range `[left, right]` that slides along the array. You extend the right end, and pull in the left end whenever the window breaks a rule. Each index enters once and leaves once, so the total is O(n).

**Problem:** the longest run of consecutive elements whose sum is at most `limit` (all values positive).

```python
def longest_run(a, limit):
    best = 0
    total = 0
    left = 0
    for right in range(len(a)):
        total += a[right]
        while total > limit:
            total -= a[left]
            left += 1
        best = max(best, right - left + 1)
    return best
```

The `while` inside the `for` looks like O(n²), but `left` only ever moves forward, at most `n` times in total.

## Prefix sums

To answer many "sum of elements from `i` to `j`" questions, precompute running totals once:

```python
prefix = [0]
for x in a:
    prefix.append(prefix[-1] + x)

# sum of a[i..j] inclusive
total = prefix[j + 1] - prefix[i]
```

O(n) to build, then O(1) per question.

## When to reach for these

| Signal in the problem | Technique |
| --- | --- |
| sorted array, looking for a pair | two pointers from both ends |
| modify an array in place, keeping some elements | slow and fast pointers |
| best contiguous run under some condition | sliding window |
| many range-sum questions on fixed data | prefix sums |

## Common mistakes

- **Using two pointers on unsorted data.** The argument for discarding an element depends on the order.
- **`lo <= hi` when a pair needs two different elements.** Use `lo < hi`.
- **Off-by-one in window length.** The window from `left` to `right` inclusive has `right - left + 1` elements.
