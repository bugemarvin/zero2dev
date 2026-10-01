---
title: Loops and collections
summary: Lists, tuples, dictionaries and sets, and the loops that walk through them.
---

## Lists

A list is an ordered collection that can grow, shrink and change.

```python
scores = [90, 72, 85]
scores[0]            # 90: indexes start at 0
scores[-1]           # 85: negative indexes count from the end
scores.append(60)    # add to the end
scores[1] = 75       # change an element
len(scores)          # 4
85 in scores         # True
```

| Operation | Effect |
| --- | --- |
| `a.append(x)` | add `x` at the end |
| `a.insert(i, x)` | insert at position `i` |
| `a.pop()` | remove and return the last element |
| `a.remove(x)` | remove the first `x` |
| `a.sort()` | sort in place |
| `sorted(a)` | return a new sorted list |
| `sum(a)`, `min(a)`, `max(a)` | total, smallest, largest |

## Slicing

`a[start:stop]` takes the elements from `start` up to, and not including, `stop`.

```python
a = [10, 20, 30, 40, 50]
a[1:3]     # [20, 30]
a[:2]      # [10, 20]       from the beginning
a[2:]      # [30, 40, 50]   to the end
a[::-1]    # [50, 40, 30, 20, 10]   reversed
```

Slicing works on strings too: `"hello"[1:3]` is `"el"`.

## for loops

`for` takes each element in turn. No index variable is needed.

```python
for score in scores:
    print(score)
```

`range` produces whole numbers:

```python
for i in range(5):          # 0 1 2 3 4
    print(i)

for i in range(2, 10, 2):   # 2 4 6 8
    print(i)
```

When you need the position as well as the value, use `enumerate`:

```python
for i, score in enumerate(scores):
    print(i, score)
```

## while loops

```python
n = 3
while n > 0:
    print(n)
    n -= 1
```

`break` leaves a loop early. `continue` jumps to the next round.

## Tuples

A tuple is a list that cannot be changed after it is made. Use one for a small fixed group of values.

```python
point = (3, 4)
x, y = point          # unpacking: x is 3, y is 4
```

Unpacking also swaps two variables in one line: `a, b = b, a`.

## Dictionaries

A dictionary maps **keys** to **values**. Finding a value by its key is very fast.

```python
ages = {"ada": 36, "linus": 54}
ages["ada"]              # 36
ages["grace"] = 85       # add or replace
"ada" in ages            # True: checks the keys
ages.get("bob", 0)       # 0: a default in place of an error
del ages["linus"]
```

Looping over one:

```python
for name, age in ages.items():
    print(name, age)
```

Counting things is the classic use:

```python
counts = {}
for word in ["a", "b", "a"]:
    counts[word] = counts.get(word, 0) + 1
# {'a': 2, 'b': 1}
```

## Sets

A set holds each value at most once, in no particular order. Checking membership is very fast.

```python
seen = {1, 2, 3}
seen.add(2)            # no effect: already there
len(set([1, 1, 2]))    # 2: a quick way to drop duplicates
{1, 2} & {2, 3}        # {2}        in both
{1, 2} | {2, 3}        # {1, 2, 3}  in either
```

## Comprehensions

A comprehension builds a list from a loop in one line:

```python
squares = [n * n for n in range(5)]            # [0, 1, 4, 9, 16]
evens = [n for n in scores if n % 2 == 0]      # keep only some
lengths = {w: len(w) for w in ["hi", "hello"]} # a dictionary
```

Read it as: *the expression, for each item, if the condition holds*. Use a plain loop when the logic no longer fits comfortably on one line.

## Which one to use

| You need | Use |
| --- | --- |
| an ordered sequence that changes | list |
| a small fixed group | tuple |
| lookup by name or ID | dict |
| uniqueness, or fast "is it in here?" | set |

## Common mistakes

- **`IndexError`**: the index is past the end. The last element of a list of length `n` is `a[n - 1]`, or `a[-1]`.
- **`KeyError`**: the key is not in the dictionary. Use `.get()` or check with `in`.
- **Changing a list while looping over it.** Elements get skipped. Build a new list.
- **`b = a` does not copy a list.** Both names refer to the same list. Use `a.copy()` or `a[:]`.
- **`a.sort()` returns `None`.** It sorts in place. `sorted(a)` returns the new list.
