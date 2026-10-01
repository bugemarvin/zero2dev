# Rank the students

**Input:** the first line holds `n`. Each of the next `n` lines holds a name and a score.

**Output:** the names, one per line, ordered by score from highest to lowest. Students with the same score are ordered by name, alphabetically.

```text
input        output
4            grace
ada 91       ada
linus 78     bob
grace 95     linus
bob 91
```

`ada` and `bob` both have 91, so they are ordered by name.

Use your language's sort with a key made of two parts.
