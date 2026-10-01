# Range sums with updates

**Input:** the first line holds `n` and `q`. The second line holds `n` whole numbers, at positions 0 to `n - 1`. Then `q` commands, one per line.

| Command | Effect | Prints |
| --- | --- | --- |
| `sum l r` | | the sum of the numbers at positions `l` to `r`, both included |
| `set i v` | replace the number at position `i` with `v` | nothing |

```text
input         output
5 4           9
1 2 3 4 5     15
sum 1 3       16
sum 0 4
set 2 10
sum 1 3
```

The three sums are 2 + 3 + 4 = 9, the whole array = 15, and 2 + 10 + 4 = 16.

Implement a segment tree, or a Fenwick tree, so that both commands take O(log n). The tests check that the answers are correct, including on an array of 50,000 numbers with thousands of commands.
