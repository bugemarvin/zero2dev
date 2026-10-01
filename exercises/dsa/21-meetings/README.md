# Most meetings in one room

**Input:** the first line holds `n`. Each of the next `n` lines holds the start and end time of a meeting. The end is always later than the start.

**Output:** the largest number of meetings that can be held in one room without any two overlapping. A meeting may start at the exact moment another one ends.

```text
input    output
4        3
1 3
2 5
3 6
6 8
```

Take 1-3, 3-6 and 6-8.

Sort by end time and always take the next meeting that starts no earlier than the last one you took ended.
