---
title: Type hints
summary: Say what types your functions expect and return, so that tools catch mistakes before the program runs.
---

## What they are

Python does not require types, and by default it does not check them. A **type hint** is a note for people and for tools:

```python
def area(width: float, height: float) -> float:
    return width * height
```

- `width: float` says the parameter should be a float.
- `-> float` says what the function returns.

Python itself ignores the hints when running. `area("a", "b")` still starts and fails in the usual way. The value comes from two places: your editor uses hints for completion and warnings, and a **type checker** reads the whole program and reports mismatches without running it.

## Variables

Hints on variables are needed less often, because the type is clear from the value:

```python
count: int = 0
name: str = "Sam"
```

## Collections

Say what is inside:

```python
def mean(values: list[float]) -> float:
    return sum(values) / len(values)

ages: dict[str, int] = {"ada": 36}
point: tuple[int, int] = (3, 4)
tags: set[str] = {"new", "sale"}
```

## Maybe a value, maybe None

A function that can return `None` must say so. This is the single most useful hint, because forgetting to handle `None` is such a common bug.

```python
def find_user(users: dict[int, str], user_id: int) -> str | None:
    return users.get(user_id)
```

`str | None` means *a string or `None`*. A type checker then insists that callers deal with the `None` case:

```python
name = find_user(users, 7)
print(name.upper())          # checker: name may be None

if name is not None:
    print(name.upper())      # fine
```

Before Python 3.10 the same thing is written `Optional[str]`, imported from `typing`. Both mean the same.

`int | str` means either type.

## Functions as arguments

```python
from typing import Callable

def apply(f: Callable[[int], int], value: int) -> int:
    return f(value)
```

`Callable[[int], int]` is a function that takes one `int` and returns an `int`.

## Classes are types

Any class can be used as a hint. Dataclasses already need hints for their fields:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

def distance(a: Point, b: Point) -> float:
    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5
```

## Running a type checker

`mypy` is the best-known one. Install it in a virtual environment:

```console
(.venv) $ python -m pip install mypy
(.venv) $ mypy shop.py
shop.py:12: error: Argument 1 to "area" has incompatible type "str"; expected "float"
Found 1 error in 1 file (checked 1 source file)
```

It found the bug on line 12 without running the program.

## How much to annotate

- **Function signatures**: always worth it. They are the contract between pieces of code.
- **Local variables**: only when the type is not obvious.
- **Small throwaway scripts**: optional.

Hints do not replace tests. Types tell you that a function returns a `float`. Tests tell you it returns the *right* float.

## Common mistakes

- **Expecting hints to be enforced at run time.** They are not. Validate real input with code.
- **`list` with no element type.** `list[int]` tells the reader, and the checker, far more.
- **Leaving out `| None`** on a function that can return `None`.
- **Using `list` in the signature when any iterable would do.** For a parameter you only loop over, `Iterable[int]` from `collections.abc` accepts lists, sets and generators alike.

That completes the Python track. Carry on with [data structures and algorithms](dsa/01-big-o), which you can solve in Python.
