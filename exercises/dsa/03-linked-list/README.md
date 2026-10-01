# Build a linked list

Implement a singly linked list of whole numbers that supports these commands.

| Command | Effect | Prints |
| --- | --- | --- |
| `push_front x` | add `x` at the front | nothing |
| `push_back x` | add `x` at the back | nothing |
| `pop_front` | remove the first element | its value, or `empty` |
| `reverse` | reverse the list | nothing |
| `print` | | all values, front to back, separated by spaces, or `empty` |

**Input:** the first line holds `q`, the number of commands. Then one command per line.

```text
input            output
7                2 1 3
push_front 1     2
push_front 2     3 1
push_back 3
print
pop_front
reverse
print
```

Build it from nodes that point to the next node. Do not use the language's built-in list as the storage: the point is to handle the links yourself. In C, free every node you remove and everything that is left at the end.

The Python starter reads the commands. Fill in the methods of the class.
