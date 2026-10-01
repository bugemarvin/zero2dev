# Merge groups

There are `n` items, numbered 0 to `n - 1`. At the start every item is in a group of its own.

| Command | Effect | Prints |
| --- | --- | --- |
| `union a b` | merge the groups containing `a` and `b` | nothing |
| `same a b` | | `yes` if `a` and `b` are in the same group, otherwise `no` |
| `count` | | the current number of groups |

**Input:** the first line holds `n` and `q`. Then `q` commands, one per line.

```text
input         output
5 6           no
same 0 1      yes
union 0 1     3
union 1 2     no
same 0 2
count
same 3 4
```

The four output lines come from `same 0 1`, `same 0 2`, `count` and `same 3 4`.

One test has 100,000 items and 150,000 unions. Use path compression and union by size.
