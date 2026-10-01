# Build a min-heap

Implement a priority queue of whole numbers that always hands out the smallest value first.

| Command | Prints |
| --- | --- |
| `push x` | nothing |
| `pop` | removes the smallest value and prints it, or prints `empty` |
| `peek` | prints the smallest value without removing it, or `empty` |
| `size` | the number of values stored |

**Input:** the first line holds `q`. Then one command per line.

```text
input       output
7           1
push 5      1
push 1      3
push 3      1
peek
pop
pop
size
```

The four output lines come from `peek`, `pop`, `pop` and `size`.

Write the heap yourself, as an array with sift-up and sift-down. The same value may be pushed more than once.
