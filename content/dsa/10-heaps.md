---
title: Heaps and priority queues
summary: Always know the smallest item, with cheap inserts and removals.
---

## Priority queue

A normal queue serves items in arrival order. A **priority queue** always serves the item with the highest priority, such as the smallest number, whatever order things arrived in.

| Operation | Meaning |
| --- | --- |
| push | add an item |
| pop | remove and return the smallest item |
| peek | look at the smallest item |

Simple attempts are slow somewhere. An unsorted list has an O(1) push and an O(n) pop. A sorted list has an O(1) pop and an O(n) push. A **heap** gives O(log n) for both, and O(1) for peek.

## The heap

A **binary min-heap** is a binary tree with two properties:

1. **Shape:** every level is full, except possibly the last, which is filled from the left.
2. **Order:** every node is smaller than or equal to its children.

```text
            1
          /   \
         3     2
        / \   /
       7   4 5
```

The smallest value is therefore always at the root. Nothing else is promised: the heap is **not** fully sorted.

## Stored in an array

Because of the shape property, the tree packs into an array with no gaps and no pointers, reading level by level:

```text
index:  0  1  2  3  4  5
value:  1  3  2  7  4  5
```

For the node at index `i`:

| Relative | Index |
| --- | --- |
| parent | `(i - 1) // 2` |
| left child | `2 * i + 1` |
| right child | `2 * i + 2` |

## Push: sift up

Put the new value at the end of the array, which keeps the shape. Then swap it with its parent for as long as it is smaller than the parent.

```python
def push(heap, value):
    heap.append(value)
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] <= heap[i]:
            break
        heap[parent], heap[i] = heap[i], heap[parent]
        i = parent
```

## Pop: sift down

The answer is the root. To remove it, move the **last** element to the root, which keeps the shape, then swap it with its **smaller** child for as long as it is larger than that child.

```python
def pop(heap):
    top = heap[0]
    last = heap.pop()
    if heap:
        heap[0] = last
        i = 0
        n = len(heap)
        while True:
            left, right = 2 * i + 1, 2 * i + 2
            smallest = i
            if left < n and heap[left] < heap[smallest]:
                smallest = left
            if right < n and heap[right] < heap[smallest]:
                smallest = right
            if smallest == i:
                break
            heap[i], heap[smallest] = heap[smallest], heap[i]
            i = smallest
    return top
```

The tree has height about log n, and both operations walk one path: **O(log n)**.

## Costs

| Operation | Cost |
| --- | --- |
| peek at the smallest | O(1) |
| push | O(log n) |
| pop | O(log n) |
| build a heap from n items | O(n) |
| search for an arbitrary value | O(n) |

## In practice

Python has `heapq`, which treats a plain list as a min-heap:

```python
import heapq

heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 1)
heapq.heappush(heap, 3)
heapq.heappop(heap)      # 1
heap[0]                  # 3: peek
```

For a **max-heap**, push the negated values and negate again on the way out. To order by priority, push tuples: `(priority, item)`.

Java has `PriorityQueue`, C++ has `priority_queue`.

## What heaps are for

**The k largest of n items.** Keep a min-heap of size `k`. For each item, push it, and if the heap grows beyond `k`, pop the smallest. What remains are the `k` largest. That is O(n log k), better than sorting everything when `k` is small.

```python
def k_largest(items, k):
    heap = []
    for x in items:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)
```

**Merging sorted lists**, **scheduling** the next event in a simulation, and [Dijkstra's shortest path algorithm](dsa/12-shortest-paths), which repeatedly needs the closest unvisited node.

**Heap sort:** build a heap from the data, then pop everything. O(n log n), in place.

## Common mistakes

- **Expecting the array to be sorted.** Only `heap[0]` is guaranteed.
- **Sifting down toward the larger child.** Swap with the **smaller** one in a min-heap.
- **Popping from an empty heap.**
- **Using a heap to search.** It only finds the minimum quickly.
