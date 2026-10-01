---
title: Linked lists
summary: A chain of nodes, each pointing to the next. Cheap to insert into, slow to index.
---

## The idea

An array keeps its elements side by side. A **linked list** keeps each element in its own small object, a **node**, which also stores where the next node is.

```text
head
 |
 v
[ 3 | *-]--> [ 7 | *-]--> [ 1 | None ]
```

The list itself only needs to remember the first node, called the **head**. The last node's `next` is empty.

```python
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next
```

In C the same node is a struct holding a value and a pointer, allocated with `malloc`:

```c
typedef struct Node {
    int value;
    struct Node *next;
} Node;
```

## Walking the list

There is no `list[i]`. To reach a node you follow the links from the head:

```python
def to_list(head):
    values = []
    node = head
    while node is not None:
        values.append(node.value)
        node = node.next
    return values
```

So reaching the i-th element is O(n).

## Inserting

At the **front**: make a node that points at the old head. No other node is touched. O(1).

```python
def push_front(head, value):
    return Node(value, head)       # the new node is the new head
```

At the **back**: walk to the last node, then attach. O(n), unless the list also keeps a pointer to its last node, the **tail**, which makes it O(1).

**After a node you already hold**: two assignments. O(1).

```python
def insert_after(node, value):
    node.next = Node(value, node.next)
```

## Removing

Removing the head is O(1): the head becomes the second node.

Removing from the middle means making the node **before** it skip over it:

```python
def remove_after(node):
    if node.next is not None:
        node.next = node.next.next
```

In C you must also `free` the removed node. Save the pointer first, re-link, then free.

## Reversing

A classic. Walk the list and turn each arrow around, keeping track of the node behind you:

```python
def reverse(head):
    prev = None
    node = head
    while node is not None:
        following = node.next     # remember where to go next
        node.next = prev          # turn the arrow around
        prev = node
        node = following
    return prev                   # the old last node is the new head
```

Trace it on paper with three nodes. Once you can draw this, you understand pointers.

## Arrays against linked lists

| Operation | Array | Linked list |
| --- | --- | --- |
| read the i-th element | O(1) | O(n) |
| insert or remove at the front | O(n) | O(1) |
| insert or remove at the end | O(1) | O(1) with a tail pointer |
| insert or remove in the middle | O(n) | O(1) once you are there, O(n) to get there |
| memory per element | just the value | the value plus a pointer |

In practice arrays win most of the time. Their elements sit together in memory, which processors handle much faster than nodes scattered around. Linked lists earn their place when you insert and remove at the ends constantly, and as a building block inside other structures: [stacks, queues](dsa/04-stacks-and-queues) and hash tables.

## Doubly linked

A **doubly linked list** gives each node a `prev` pointer as well. You can then walk backwards and remove a node knowing only the node itself, at the cost of an extra pointer per node and more links to keep correct.

## The fast and slow trick

Two pointers, one moving one step at a time and the other two. When the fast one reaches the end, the slow one is in the middle. If the list has a cycle, the fast one eventually catches the slow one. Both run in O(n) with no extra memory.

## Common mistakes

- **Losing the rest of the list.** Overwriting `node.next` before saving it cuts off everything after. Save first.
- **Forgetting the empty list.** `head` may be `None`. Check before reading `head.next`.
- **Forgetting to update the head** when the first node changes.
- **In C: leaking removed nodes**, or reading `node->next` after `free(node)`.
