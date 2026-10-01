# Shortest path in a grid

**Input:** the first line holds the number of rows and columns. Then the grid, one row per line:

- `.` is open floor
- `#` is a wall
- `S` is the start
- `G` is the goal

**Output:** the smallest number of steps from `S` to `G`, moving up, down, left or right, never through a wall. If the goal cannot be reached, print `-1`.

```text
input      output
3 4        5
S.#.
.##.
...G
```

The route goes down, down, right, right, right.

Use breadth-first search. It reaches cells in order of distance, so the first time it arrives at `G` is by a shortest route.
