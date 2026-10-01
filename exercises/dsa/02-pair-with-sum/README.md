# Pair with a given sum

**Input:** the first line holds `n` and `target`. The second line holds `n` different whole numbers in **increasing order**.

**Output:** two of the numbers, `a b` with `a < b`, that add up to `target`. If several pairs do, print the one with the smallest `a`. If there is none, print `none`.

```text
input            output
6 10             1 9
1 2 4 7 9 12
```

`n` can be 200,000. Comparing every pair is far too slow for that. Use two pointers, one at each end.
