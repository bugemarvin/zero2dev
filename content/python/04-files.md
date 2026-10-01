---
title: Files
summary: Read and write text files safely, and work with paths, CSV and JSON.
---

## Opening with `with`

```python
with open("notes.txt") as f:
    text = f.read()
```

The `with` block closes the file when the block ends, even if an error occurs inside it. Always open files this way.

| Mode | Meaning |
| --- | --- |
| `"r"` | read (the default). The file must exist. |
| `"w"` | write. Creates the file, or **empties** it if it exists. |
| `"a"` | append to the end |

Pass `encoding="utf-8"` so that the result is the same on every system:

```python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()
```

## Reading

```python
with open("notes.txt", encoding="utf-8") as f:
    text = f.read()               # the whole file as one string

with open("notes.txt", encoding="utf-8") as f:
    for line in f:                # one line at a time: good for large files
        print(line.rstrip("\n"))
```

Each line read from a file still ends with its newline `"\n"`. Remove it with `.rstrip("\n")`, or `.strip()` to remove all surrounding whitespace.

`text.splitlines()` turns a string into a list of lines, with the newlines removed.

## Writing

```python
with open("report.txt", "w", encoding="utf-8") as f:
    f.write("Total: 42\n")
    f.write(f"Average: {3.5:.1f}\n")
```

`write` does not add a newline. You add `"\n"` yourself.

## Paths

`pathlib` handles paths correctly on every operating system:

```python
from pathlib import Path

folder = Path("data")
file = folder / "scores.txt"       # joins with the right separator

file.exists()                      # True or False
file.name                          # 'scores.txt'
file.suffix                        # '.txt'
file.read_text(encoding="utf-8")   # shortcut for open + read
file.write_text("hello\n", encoding="utf-8")

for p in folder.glob("*.txt"):     # every .txt file in the folder
    print(p)
```

## Parsing lines

Much real data is one record per line, with fields separated by a comma:

```text
ada,91
linus,78
```

```python
scores = {}
with open("scores.txt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue                 # skip blank lines
        name, score = line.split(",")
        scores[name] = int(score)
```

## CSV and JSON

For real CSV files, with quotes and commas inside fields, use the `csv` module instead of `split`:

```python
import csv

with open("people.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["name"], row["age"])
```

JSON stores lists and dictionaries as text, and is how most programs exchange data:

```python
import json

data = {"name": "Sam", "scores": [90, 72]}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

with open("data.json", encoding="utf-8") as f:
    loaded = json.load(f)
```

## Common mistakes

- **Opening with `"w"` by accident.** The contents are gone the moment the file is opened.
- **Forgetting the newline at the end of each line** when comparing or converting. `int("42\n")` works, but `"ada\n" == "ada"` is false.
- **Relative paths.** `open("notes.txt")` looks in the folder you ran the program from, which may not be the folder the script is in.
- **Reading twice.** After `f.read()` the file is at its end, and a second `read()` returns an empty string.
