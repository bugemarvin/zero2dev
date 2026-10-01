# Smallest ship that is fast enough

Packages wait on a conveyor belt and must be shipped **in the given order**. Each day the ship is loaded with the next packages from the belt, as many as fit within its capacity, and sails.

**Input:** the first line holds `n` and `days`. The second line holds the `n` package weights.

**Output:** the smallest capacity with which all packages are shipped within `days` days.

```text
input                     output
10 5                      15
1 2 3 4 5 6 7 8 9 10
```

With capacity 15 the days are: 1-5, 6-7, 8, 9, 10.

A capacity either works or it does not, and once one works every larger one works too. Binary search on the capacity, between the heaviest package and the total weight.
