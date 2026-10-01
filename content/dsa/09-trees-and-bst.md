---
title: Trees and binary search trees
summary: Data arranged in levels, and a tree that keeps its values in order for fast search.
---

## Trees

A tree is made of **nodes** joined by links, with one node at the top called the **root**. Each node has zero or more **children**. A node with no children is a **leaf**.

```text
            8            <- root
          /   \
         3     10
        / \      \
       1   6      14     <- 1, 6 and 14 are leaves
```

- The **depth** of a node is its distance from the root.
- The **height** of a tree is the number of nodes on the longest path from the root down to a leaf. This tree has height 3. An empty tree has height 0.

File systems, the structure of an HTML page and the organisation of a company are all trees.

In a **binary tree** every node has at most two children, called left and right.

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
```

## Trees are recursive

Each child of a node is itself the root of a smaller tree. So almost every tree function has the same shape: handle the empty tree, then combine the answers from the two subtrees.

```python
def height(node):
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

def size(node):
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)
```

## Traversals

Three ways to visit every node, depending on when the node itself is handled relative to its children:

| Order | Sequence | Result for the tree above |
| --- | --- | --- |
| pre-order | node, left, right | 8 3 1 6 10 14 |
| in-order | left, node, right | 1 3 6 8 10 14 |
| post-order | left, right, node | 1 6 3 14 10 8 |

```python
def in_order(node, out):
    if node is None:
        return
    in_order(node.left, out)
    out.append(node.value)
    in_order(node.right, out)
```

Visiting level by level, top to bottom, is a [breadth-first search](dsa/11-graphs-bfs-dfs) and uses a queue.

## Binary search trees

A **binary search tree** (BST) adds one rule. For every node:

- everything in its **left** subtree is **smaller**;
- everything in its **right** subtree is **larger**.

The tree in the picture is a BST. The rule means each comparison tells you which way to go, exactly like binary search.

**Search:**

```python
def contains(node, target):
    while node is not None:
        if target == node.value:
            return True
        node = node.left if target < node.value else node.right
    return False
```

**Insert:** search for the value. The empty spot where the search falls off the tree is where it belongs.

```python
def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    elif value > node.value:
        node.right = insert(node.right, value)
    return node              # an equal value is already there: nothing to do

root = None
for v in [8, 3, 10, 1, 6, 14]:
    root = insert(root, v)
```

The in-order traversal of a BST visits the values **in sorted order**. That is the property a hash table cannot give you.

The smallest value is found by going left until you cannot. The largest by going right.

## Cost depends on shape

Every operation follows one path from the root, so it costs O(height).

| Shape | Height | Search, insert |
| --- | --- | --- |
| balanced | about log n | O(log n) |
| degenerate (a chain) | n | O(n) |

Insert the values 1, 2, 3, 4, 5 in that order and every node goes to the right of the one before. The "tree" is a linked list.

**Self-balancing trees**, such as red-black trees and AVL trees, rearrange themselves on insert and delete to keep the height near log n. They are what sits behind `TreeMap` in Java and `std::map` in C++. You rarely write one, and it is worth knowing they exist.

## Removing a node

Three cases:

1. **A leaf:** remove it.
2. **One child:** replace the node with its child.
3. **Two children:** replace the node's value with the smallest value in its right subtree (its **in-order successor**), then remove that successor, which has at most one child.

## Hash table or BST?

| Need | Hash table | Balanced BST |
| --- | --- | --- |
| lookup, insert, delete | O(1) average | O(log n) |
| keys in sorted order | no | yes |
| smallest, largest, next larger | O(n) | O(log n) |
| all keys in a range | O(n) | O(log n + results) |

## Common mistakes

- **Not handling `None`** before reading `node.left` or `node.value`.
- **Forgetting to re-attach** in a recursive insert: `node.left = insert(node.left, value)`.
- **Assuming a BST is balanced.** Sorted input gives the worst case.
- **Checking the BST rule only against the direct children.** It applies to the whole subtree.
