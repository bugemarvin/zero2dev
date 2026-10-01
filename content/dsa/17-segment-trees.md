---
title: Segment trees
summary: Answer range questions and change single values, both in O(log n).
---

## The problem

An array of numbers receives two kinds of request, mixed together and many of each:

- **query(l, r):** the sum of the elements from index `l` to `r`;
- **update(i, v):** set element `i` to `v`.

| Approach | Query | Update |
| --- | --- | --- |
| plain array | O(n) | O(1) |
| [prefix sums](dsa/02-arrays-and-two-pointers) | O(1) | O(n), every later total changes |
| segment tree | O(log n) | O(log n) |

With 100,000 elements and 100,000 requests, an O(n) side means ten billion steps. A segment tree needs about two million.

## The structure

A segment tree is a binary tree in which every node stores the answer for one **range** of the array.

- The root covers the whole array.
- Each node's two children cover the left and right halves of its range.
- The leaves are the single elements.

For the array `[2, 5, 1, 4]`, with sums:

```text
             [0..3] = 12
            /           \
      [0..1] = 7      [2..3] = 5
       /     \         /     \
    [0]=2   [1]=5   [2]=1   [3]=4
```

The height is about log n. Any range `[l, r]` can be assembled from at most about `2 × log n` nodes, and changing one element touches only the nodes on one path to the root.

## An iterative implementation

Store the tree in an array of size `2n`. The leaves sit at positions `n` to `2n - 1`, and the parent of node `i` is `i // 2`. This version is short and works for any `n`.

```python
class SegmentTree:
    def __init__(self, data):
        self.n = len(data)
        self.tree = [0] * (2 * self.n)
        self.tree[self.n:] = data                     # the leaves
        for i in range(self.n - 1, 0, -1):            # parents, from the bottom up
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, index, value):
        i = index + self.n
        self.tree[i] = value
        i //= 2
        while i >= 1:
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]
            i //= 2

    def query(self, left, right):
        """Sum of the elements from left to right, both included."""
        total = 0
        lo = left + self.n
        hi = right + self.n + 1                       # one past the end
        while lo < hi:
            if lo % 2 == 1:                           # lo is a right child: take it, step right
                total += self.tree[lo]
                lo += 1
            if hi % 2 == 1:                           # hi is a right child: step left, take that
                hi -= 1
                total += self.tree[hi]
            lo //= 2
            hi //= 2
        return total
```

**Update** changes the leaf, then recomputes each ancestor from its two children.

**Query** begins with the two ends at the leaves and moves upwards. Whenever an end sits on a node that is not fully shared with its sibling, that node is added on its own and the end moves inwards. Everything else gets covered by a parent one level up.

## The recursive view

The same structure is often written recursively, which generalises more easily. A query on a node has three cases:

1. the node's range lies entirely **outside** the query: contributes nothing;
2. the node's range lies entirely **inside** the query: return its stored value;
3. it overlaps **partly**: ask both children and combine.

## Not only sums

Replace `+` with any operation that combines two neighbouring ranges into one, and replace 0 with that operation's neutral value.

| Question | Combine with | Neutral value |
| --- | --- | --- |
| sum of a range | `a + b` | 0 |
| minimum of a range | `min(a, b)` | infinity |
| maximum of a range | `max(a, b)` | minus infinity |
| greatest common divisor | `gcd(a, b)` | 0 |

For operations where order matters, combine the left pieces and the right pieces separately and join them at the end.

## Related structures

A **Fenwick tree**, or binary indexed tree, does prefix sums with point updates in O(log n), in about ten lines and with less memory. It handles sums and is less general.

**Lazy propagation** extends a segment tree to update a whole **range** in O(log n), for example "add 5 to every element from `l` to `r`". Each node keeps a pending change and passes it to its children only when someone needs to look below.

| Need | Structure |
| --- | --- |
| range sums, values never change | prefix sums |
| range sums, single values change | Fenwick tree or segment tree |
| range minimum or maximum, values change | segment tree |
| range updates and range queries | segment tree with lazy propagation |

## Common mistakes

- **Mixing inclusive and exclusive ends.** Decide once what `right` means and keep to it.
- **Not updating the ancestors** after changing a leaf.
- **Using the wrong neutral value**, such as 0 for a minimum.
- **Building a segment tree when the data never changes.** Prefix sums are simpler and faster.

## Where to go from here

You now have the standard toolkit: arrays, linked lists, stacks, queues, hash tables, trees, heaps, graphs, tries, union-find and segment trees, together with sorting, searching, recursion, dynamic programming and greedy methods.

What turns that knowledge into skill is practice. Solve the exercises in a second language. Then take new problems and ask the same questions each time: how large is the input, which complexity can I afford, and which structure makes the expensive operation cheap?
