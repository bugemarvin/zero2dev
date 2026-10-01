---
title: Union-find
summary: Keep track of which items belong to the same group while groups keep merging.
---

## The problem

You have `n` items, each in its own group at the start. Two operations arrive in any order:

- **union(a, b):** merge the groups containing `a` and `b`;
- **find(a):** which group is `a` in? From this follows: are `a` and `b` in the same group?

Examples: computers being connected by cables, pixels of the same colour joining into regions, accounts that turn out to belong to the same person.

Running a [graph search](dsa/11-graphs-bfs-dfs) for every question is O(n) each. **Union-find**, also called a disjoint-set union, answers in practically constant time.

## The representation

Each group is a tree, and each item stores its **parent**. The root of the tree is the group's representative. A root is its own parent.

```text
parent:  index  0  1  2  3  4  5
         value  0  0  1  3  3  5

    0        3      5
    |        |
    1        4
    |
    2
```

Three groups: {0, 1, 2}, {3, 4} and {5}.

- **find(a):** follow parents until you reach a root.
- **union(a, b):** find both roots. If they differ, make one the parent of the other.

Two items are in the same group exactly when they have the same root.

## Basic version

```python
parent = list(range(n))          # everyone starts as their own root

def find(x):
    while parent[x] != x:
        x = parent[x]
    return x

def union(a, b):
    root_a, root_b = find(a), find(b)
    if root_a != root_b:
        parent[root_a] = root_b
```

This is correct and can be slow. Unlucky unions build a tall chain, and `find` then walks all of it: O(n).

## Two improvements

**Path compression.** After finding the root, point every node on the path directly at it. The next `find` for any of them takes one step.

```python
def find(x):
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != root:          # second pass: re-point the path
        parent[x], x = root, parent[x]
    return root
```

**Union by size.** Always attach the smaller tree beneath the root of the larger one, so that trees stay shallow.

Together:

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.groups = n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False              # already together
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra          # smaller tree goes under the larger
        self.size[ra] += self.size[rb]
        self.groups -= 1
        return True

    def same(self, a, b):
        return self.find(a) == self.find(b)
```

With both improvements, each operation costs so close to O(1) that for any input that fits in a computer you can treat it as constant.

Keeping `groups` up to date gives the number of groups at any moment for free. `size[find(x)]` is the size of the group containing `x`.

## Uses

**Connected components.** Union the two ends of every edge. The number of groups left is the number of components.

**Cycle detection** in an undirected graph. Before adding an edge, check whether its two ends are already in the same group. If they are, the edge closes a cycle.

**Kruskal's algorithm** for the cheapest set of edges that connects every node, a **minimum spanning tree**. Sort the edges by weight and add each one unless it would close a cycle:

```python
def minimum_spanning_tree(n, edges):
    uf = UnionFind(n)
    total = 0
    for weight, a, b in sorted(edges):
        if uf.union(a, b):
            total += weight
    return total
```

It is a [greedy algorithm](dsa/14-greedy), and union-find is what makes the cycle check fast.

## Union-find or graph search?

| Situation | Use |
| --- | --- |
| connections fixed, one question | BFS or DFS |
| connections added over time, many questions | union-find |
| connections also **removed** | neither works directly: union-find cannot split a group |
| need the actual path | BFS or DFS |

## Common mistakes

- **Comparing `parent[a] == parent[b]`.** Compare the roots: `find(a) == find(b)`.
- **Attaching a node instead of its root.** `parent[a] = b` cuts `a` away from the rest of its group. Link root to root.
- **Updating `size` or the group count when the two were already together.**
- **Mixing 0-based and 1-based item numbers.**
