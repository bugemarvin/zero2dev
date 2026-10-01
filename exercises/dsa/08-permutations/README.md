# All permutations

**Input:** one number `n`, from 1 to 7.

**Output:** every ordering of the numbers 1 to `n`, one per line, in dictionary order.

```text
input     output
3         1 2 3
          1 3 2
          2 1 3
          2 3 1
          3 1 2
          3 2 1
```

Write the backtracking yourself. Build the permutation one position at a time, trying the unused numbers in increasing order.
