# Count connected components

**Input:** the first line holds `n`, the number of nodes, and `m`, the number of edges. The nodes are numbered 1 to `n`. Each of the next `m` lines holds two nodes joined by an undirected edge.

**Output:** the number of connected components. A node with no edges is a component by itself.

```text
input     output
6 3       3
1 2
2 3
4 5
```

The components are {1, 2, 3}, {4, 5} and {6}.

One test has 200,000 nodes in two long chains. A recursive depth-first search goes 100,000 calls deep there, which is more than most languages allow. Use a queue or an explicit stack.
