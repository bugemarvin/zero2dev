# Balanced brackets

**Input:** the first line holds `t`. Each of the next `t` lines is a piece of text that may contain the brackets `( ) [ ] { }` and other characters.

**Output:** for each line, `yes` if the brackets are balanced and `no` otherwise.

Balanced means every opening bracket is closed by a bracket of the same kind, in the right order. Characters that are not brackets are ignored.

```text
input          output
4              yes
{[()]}         no
([)]           no
((             yes
a[i]=(b+c)
```
