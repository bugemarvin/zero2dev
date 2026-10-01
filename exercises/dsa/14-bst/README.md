# Build a binary search tree

Implement a binary search tree of whole numbers that supports these commands.

| Command | Prints |
| --- | --- |
| `insert x` | nothing. Inserting a value that is already present changes nothing. |
| `contains x` | `yes` or `no` |
| `min` | the smallest value, or `empty` |
| `max` | the largest value, or `empty` |
| `height` | the number of nodes on the longest path from the root to a leaf. An empty tree has height 0. |
| `inorder` | all values in increasing order, separated by spaces, or `empty` |

**Input:** the first line holds `q`. Then one command per line.

```text
input          output
10             yes
insert 8       no
insert 3       1
insert 10      10
insert 1       3
contains 3     1 3 8 10
contains 7
min
max
height
inorder
```

Do not rebalance the tree: `height` must reflect plain insertion in the order given.
