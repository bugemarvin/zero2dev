# Count inversions

An **inversion** is a pair of positions `i < j` where the earlier number is larger: `a[i] > a[j]`. The count measures how far a list is from being sorted. A sorted list has 0.

**Input:** the first line holds `n`. The second line holds `n` whole numbers.

**Output:** the number of inversions.

```text
input        output
5            4
3 1 4 5 2
```

The four pairs are (3, 1), (3, 2), (4, 2) and (5, 2).

`n` can be 100,000, where checking every pair takes far too long. Count the inversions during the merge step of merge sort, as the lesson describes.
