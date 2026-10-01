# Read and write score files

Write three functions in `solution.py`.

`count_lines(path)` returns the number of lines in the file.

`read_scores(path)` reads a file where each line is `name,score` and returns a dictionary such as `{"ada": 91, "linus": 78}`, with the scores as integers. Blank lines are skipped, and spaces around a name or score are removed.

```text
ada,91
linus, 78

grace,95
```

`save_report(path, scores)` writes the dictionary to a file, one `name: score` per line, ordered by score from highest to lowest. Equal scores are ordered by name. Every line ends with a newline.

```text
grace: 95
ada: 91
linus: 78
```
