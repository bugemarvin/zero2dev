# Longest common subsequence

A subsequence of a string keeps some of its characters in their original order. They do not have to be next to each other. `ACE` is a subsequence of `ABCDE`.

**Input:** two lines, each holding one string of upper-case letters. A line may be empty.

**Output:** the length of the longest subsequence that the two strings have in common.

```text
input       output
ABCBDAB     4
BDCABA
```

One common subsequence of length 4 is `BCBA`.

The strings can be 1,500 characters long. Fill a table where the cell for `(i, j)` is the answer for the first `i` characters of one string and the first `j` characters of the other.
