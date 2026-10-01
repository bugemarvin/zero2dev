# Two sum

**Input:** the first line holds `n` and `target`. The second line holds `n` whole numbers, in no particular order.

**Output:** the positions `i j` (counting from 0, with `i < j`) of the two numbers that add up to `target`. Every test has exactly one such pair.

```text
input           output
5 9             1 3
8 2 11 7 15
```

Positions 1 and 3 hold 2 and 7.

`n` can be 100,000, so checking every pair is too slow. Use a dictionary (hash map) to find each number's partner in O(1).
