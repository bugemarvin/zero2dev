---
title: Stacks and queues
summary: Two restricted lists that turn up everywhere. One serves the newest item first, the other the oldest.
---

## Stack: last in, first out

A stack is a pile. You add to the top and take from the top.

| Operation | Meaning | Cost |
| --- | --- | --- |
| push | put an item on top | O(1) |
| pop | remove and return the top item | O(1) |
| peek | look at the top item | O(1) |

A Python list is already a stack, using its end as the top:

```python
stack = []
stack.append(1)     # push
stack.append(2)
stack[-1]           # peek: 2
stack.pop()         # 2
stack.pop()         # 1
```

Stacks appear wherever the most recent thing must be dealt with first: the undo history of an editor, the back button of a browser, and the **call stack** that tracks which function called which.

## Worked example: matching brackets

Is `{[()]}` balanced? Every opening bracket must be closed by the same kind, in the reverse order. "Most recent first" means a stack.

```python
def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
```

Three ways to fail: a closer with nothing open, a closer of the wrong kind, or something still open at the end. The final `not stack` covers the third.

## Worked example: postfix expressions

In postfix notation the operator comes after its operands: `3 4 + 2 *` means `(3 + 4) * 2`. No brackets are ever needed, and a stack evaluates it in one pass:

- a number: push it;
- an operator: pop two values, apply it, push the result.

```python
def evaluate(tokens):
    stack = []
    for token in tokens:
        if token in "+-*":
            b = stack.pop()       # the second operand is on top
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            else:
                stack.append(a * b)
        else:
            stack.append(int(token))
    return stack.pop()
```

Note the order when popping: for `5 3 -` the top of the stack is 3, and the answer is `5 - 3`.

## Queue: first in, first out

A queue is a line of people. You join at the back and leave from the front.

| Operation | Meaning | Cost |
| --- | --- | --- |
| enqueue | add at the back | O(1) |
| dequeue | remove from the front | O(1) |

A plain Python list is a **bad** queue: `list.pop(0)` shifts every remaining element, which is O(n). Use `collections.deque`, which is O(1) at both ends:

```python
from collections import deque

queue = deque()
queue.append("a")      # enqueue
queue.append("b")
queue.popleft()        # 'a'
```

Queues model anything handled in arrival order: print jobs, requests to a server, and the frontier of a [breadth-first search](dsa/11-graphs-bfs-dfs).

## Building them yourself

| Structure | Built on an array | Built on a linked list |
| --- | --- | --- |
| stack | push and pop at the end | push and pop at the head |
| queue | a circular buffer with two indexes | add at the tail, remove at the head |

A **circular buffer** keeps a `head` index and a count in a fixed array. Indexes wrap around with `% capacity`, so nothing ever shifts.

A **deque** (double-ended queue) allows adding and removing at both ends, and can serve as either.

## Monotonic stack

A stack kept in sorted order answers "what is the next greater element?" for every position in O(n). For each new value, pop everything smaller: the new value is the answer for each of those.

```python
def next_greater(a):
    result = [-1] * len(a)
    stack = []                       # indexes still waiting for an answer
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            result[stack.pop()] = x
        stack.append(i)
    return result
```

Each index is pushed once and popped at most once, so the total is O(n) despite the nested loop.

## Common mistakes

- **Popping from an empty stack.** Check first, or the program crashes.
- **Using `list.pop(0)` as a queue.** It works, and it is O(n) per call.
- **Operand order** for `-` and `/` in postfix evaluation.
- **Forgetting the final check** that the stack is empty in bracket matching.
