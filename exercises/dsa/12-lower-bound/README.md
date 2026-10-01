# First position not less than x

**Input:** the first line holds `n` and `q`. The second line holds `n` whole numbers in non-decreasing order (duplicates are allowed). The third line holds `q` query values.

**Output:** for each query `x`, on its own line, the first position (counting from 0) whose number is greater than or equal to `x`. If every number is smaller than `x`, print `n`.

```text
input            output
6 4              1
1 3 3 5 8 8      3
3 4 9 0          6
                 0
```

Write the binary search yourself. `n` can be 200,000 with 2,000 queries, so scanning from the start for each query is too slow.
