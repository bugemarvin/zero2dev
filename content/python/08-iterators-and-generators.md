---
title: Iterators and generators
summary: Produce values one at a time, only when they are asked for.
---

## What a for loop really does

Anything you can loop over is an **iterable**: lists, strings, dictionaries, files, ranges. A `for` loop asks the iterable for an **iterator**, then asks that iterator for the next value, again and again, until it runs out.

You can do the same by hand:

```python
it = iter([10, 20])
next(it)      # 10
next(it)      # 20
next(it)      # raises StopIteration: nothing left
```

An iterator remembers where it is, and goes forward only. Once used up, it stays empty.

## Generators

A **generator** is the easy way to write your own iterator. It is a function that uses `yield`:

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)          # 3, 2, 1
```

Calling `countdown(3)` runs **none** of the body. It returns a generator object. Each time a value is requested, the function runs up to the next `yield`, hands that value over, and **pauses**, keeping all its local variables. The next request resumes right after the `yield`.

```python
gen = countdown(2)
next(gen)     # 2
next(gen)     # 1
next(gen)     # StopIteration
```

## Why this matters: laziness

A list holds all of its values in memory at once. A generator produces each value when it is needed and then forgets it.

```python
def read_big_file(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")
```

This handles a file of any size with the memory of one line.

A generator can even be endless, because nothing is computed until someone asks:

```python
def naturals():
    n = 0
    while True:
        yield n
        n += 1
```

Never write `list(naturals())`. Take only what you need:

```python
from itertools import islice

list(islice(naturals(), 5))     # [0, 1, 2, 3, 4]
```

## Generator expressions

Like a list comprehension, with round brackets. It builds no list.

```python
total = sum(n * n for n in range(1_000_000))
```

The squares are produced one by one and added up. A list of a million numbers never exists.

| | List comprehension | Generator expression |
| --- | --- | --- |
| Syntax | `[x for x in data]` | `(x for x in data)` |
| Memory | holds everything | one value at a time |
| Reusable | yes | no, one pass only |
| Index with `[i]`, `len()` | yes | no |

## Tools that work with any iterable

```python
names = ["ada", "linus"]
ages = [36, 54]

for name, age in zip(names, ages):      # pairs things up
    print(name, age)

for i, name in enumerate(names, start=1):
    print(i, name)

any(a > 50 for a in ages)     # True: at least one
all(a > 50 for a in ages)     # False: not every one
```

The `itertools` module has many more: `islice` (take a slice), `chain` (join iterables end to end), `count` (count upwards for ever).

## Pipelines

Generators connect like the pipes in the [terminal](start/05-pipes-and-redirection). Each stage pulls from the one before it:

```python
lines = read_big_file("access.log")
errors = (line for line in lines if "ERROR" in line)
users = (line.split()[2] for line in errors)

for user in users:
    print(user)
```

Nothing is read from the file until the final loop starts asking.

## Common mistakes

- **Using a generator twice.** The second loop gets nothing. Create a new generator, or store the values in a list.
- **Calling `len()` or indexing on a generator.** Neither is supported.
- **Expecting the body to run at the call.** It runs only when values are requested.
- **`return` with a value** in a generator does not produce that value. Use `yield`.
