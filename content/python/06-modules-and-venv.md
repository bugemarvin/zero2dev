---
title: Modules, packages and virtual environments
summary: Use the standard library, split your code into files, and install other people's code without making a mess.
---

## Importing

A **module** is a Python file. `import` makes its contents available.

```python
import math
math.sqrt(16)              # 4.0

from math import sqrt, pi  # bring specific names in directly
sqrt(16)

import datetime as dt      # give a module a shorter name
dt.date.today()
```

Prefer `import math` and writing `math.sqrt`. The reader can see where each name comes from. Avoid `from math import *`, which pours every name into your file.

## The standard library

Python ships with a large library. Before you write a helper, check whether it already exists.

| Module | For |
| --- | --- |
| `math` | square roots, trigonometry, constants |
| `random` | random numbers and choices |
| `datetime` | dates and times |
| `pathlib` | file paths |
| `json`, `csv` | data formats |
| `collections` | `Counter`, `defaultdict`, `deque` |
| `itertools` | tools for loops and combinations |
| `re` | regular expressions |
| `sys`, `os` | arguments, environment, the system |

A few you will use constantly:

```python
from collections import Counter

counts = Counter(["a", "b", "a", "c", "a"])
counts["a"]               # 3
counts.most_common(2)     # [('a', 3), ('b', 1)]
```

```python
from datetime import date

start = date.fromisoformat("2025-01-01")
end = date(2025, 3, 1)
(end - start).days        # 59
```

## Your own modules

Any `.py` file is a module. With two files in the same folder:

```python
# shapes.py
def area(width, height):
    return width * height
```

```python
# main.py
import shapes

print(shapes.area(3, 4))
```

A folder of modules is a **package**: `import mypackage.shapes`.

## Run or import

When a file is run directly, the special variable `__name__` is `"__main__"`. When it is imported, `__name__` is the module's name. This lets one file be both a program and a library:

```python
def area(width, height):
    return width * height

if __name__ == "__main__":
    print(area(3, 4))      # runs with: python3 shapes.py
                           # does not run on: import shapes
```

Put the code that *does things* under that `if`. Then importing the file to test its functions has no side effects.

## Installing packages

`pip` installs packages from the Python Package Index:

```console
$ python3 -m pip install requests
```

Do not do that globally. Different projects need different versions of the same package, and on Linux the system itself depends on its own Python packages.

## Virtual environments

A **virtual environment** is a private folder of packages for one project.

```console
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ python -m pip install requests
(.venv) $ deactivate
```

- `python3 -m venv .venv` creates the environment in a folder named `.venv`. Do it once per project.
- `source .venv/bin/activate` switches this terminal to it. The prompt shows `(.venv)`.
- While it is active, `python` and `pip` use the environment.
- `deactivate` switches back.

Add `.venv/` to `.gitignore`. The environment is never committed.

## Recording what a project needs

```console
(.venv) $ python -m pip freeze > requirements.txt
```

Someone else then recreates the same environment:

```console
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ python -m pip install -r requirements.txt
```

## Common mistakes

- **Naming your file after a library module**, such as `random.py` or `math.py`. Then `import random` imports your own file.
- **Installing packages with no environment active.**
- **Committing `.venv`.** Commit `requirements.txt`.
- **Code at the top level of a module** that runs whenever it is imported. Put it under `if __name__ == "__main__":`.
