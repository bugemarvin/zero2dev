# Count the N queens solutions

A queen attacks along its row, its column and both diagonals.

**Input:** one number `n`, from 1 to 9.

**Output:** the number of ways to place `n` queens on an `n` by `n` board so that no two attack each other.

```text
input    output
4        2
```

Place one queen per row. Before placing a queen in a column, check that the column and both diagonals are free. Abandon a branch as soon as there is a conflict.
