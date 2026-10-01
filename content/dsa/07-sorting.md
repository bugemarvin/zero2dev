---
title: Sorting
summary: Simple sorts that are easy to write, fast sorts that scale, and how to choose.
---

## Why sorting matters

Sorted data can be searched in O(log n), duplicates end up next to each other, and many problems become easy once the input is in order. Sorting is also the classic place to see how much the choice of algorithm matters.

## Insertion sort: O(n²)

Grow a sorted section at the front. Take the next element and slide it left until it is in place, the way you sort a hand of cards.

```python
def insertion_sort(a):
    for i in range(1, len(a)):
        value = a[i]
        j = i - 1
        while j >= 0 and a[j] > value:
            a[j + 1] = a[j]         # shift right
            j -= 1
        a[j + 1] = value
```

It is O(n²) in general, and O(n) when the input is already nearly sorted. For small arrays it is faster than the clever algorithms, which is why real libraries use it for short runs.

## Merge sort: O(n log n)

Divide and conquer:

1. Split the array in half.
2. Sort each half, recursively.
3. **Merge** the two sorted halves into one.

Merging two sorted lists takes one pass: keep taking the smaller of the two front elements.

```python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])

    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged
```

The array is halved about log n times, and each level does O(n) work in merging: **O(n log n)** in every case. The cost is O(n) extra memory for the merged lists.

Using `<=` when the two front elements are equal keeps equal elements in their original order. A sort with that property is called **stable**.

## Counting inversions

An **inversion** is a pair of positions `i < j` with `a[i] > a[j]`: two elements that are out of order. Counting them by checking every pair is O(n²). Merge sort can count them for free.

During a merge, whenever an element is taken from the **right** half, it jumps ahead of every element still waiting in the left half. Each of those is one inversion:

```python
        else:
            merged.append(right[j])
            j += 1
            inversions += len(left) - i
```

Total: the inversions inside the left half, plus those inside the right half, plus those counted while merging.

## Quicksort: O(n log n) on average

1. Pick a **pivot** element.
2. **Partition**: move everything smaller to its left, everything larger to its right.
3. Sort the two sides, recursively.

```python
def quicksort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    pivot = a[(lo + hi) // 2]
    i, j = lo, hi
    while i <= j:
        while a[i] < pivot:
            i += 1
        while a[j] > pivot:
            j -= 1
        if i <= j:
            a[i], a[j] = a[j], a[i]
            i += 1
            j -= 1
    quicksort(a, lo, j)
    quicksort(a, i, hi)
```

It sorts in place and is very fast in practice. Its weakness is the worst case: if the pivot is always the smallest or largest element, the split is lopsided and the time becomes O(n²). Choosing the middle element, or a random one, makes that unlikely.

## Comparison

| Algorithm | Best | Average | Worst | Extra memory | Stable |
| --- | --- | --- | --- | --- | --- |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | yes |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | yes |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | no |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | no |

No sort that works by comparing elements can beat O(n log n) in general.

## Counting sort: O(n + k)

When the values are small whole numbers in a known range `0..k`, you do not need to compare at all. Count how many times each value occurs, then write them out in order.

```python
def counting_sort(a, k):
    counts = [0] * (k + 1)
    for x in a:
        counts[x] += 1
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)
    return result
```

## In real code

Use the sort your language provides. It is fast, well tested and stable in most languages.

```python
people.sort(key=lambda p: p.age)                     # in place
by_name = sorted(people, key=lambda p: p.name)       # new list
ranked = sorted(scores, reverse=True)
```

Sort by several fields with a tuple key: `key=lambda p: (-p.score, p.name)` orders by score from high to low, then by name.

You write sorting algorithms yourself in order to understand them, and because their ideas, like merging and partitioning, solve other problems too.

## Common mistakes

- **Writing your own sort in production code.**
- **Losing stability by accident**, with `<` where `<=` belongs in a merge.
- **Quicksort on sorted input with the first element as pivot**: the O(n²) case.
- **Sorting when you only need the minimum, maximum, or the top few.** One pass or a [heap](dsa/10-heaps) is cheaper.
