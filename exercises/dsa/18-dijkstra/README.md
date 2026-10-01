# Cheapest routes from node 1

**Input:** the first line holds `n` and `m`. The nodes are numbered 1 to `n`. Each of the next `m` lines holds `a b w`: a **one-way** road from `a` to `b` that costs `w`. Costs are zero or more.

**Output:** one line with `n` numbers: the cheapest total cost from node 1 to each of the nodes 1, 2, ..., `n`. Print `-1` for a node that cannot be reached.

```text
input      output
4 4        0 2 3 -1
1 2 2
1 3 5
2 3 1
4 1 1
```

Node 3 is cheaper through node 2 (2 + 1) than directly (5). Node 4 has a road out and none in, so it cannot be reached.
