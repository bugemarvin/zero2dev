---
title: Functions in depth
summary: Default values, keyword arguments, several return values, scope, and passing functions around.
---

## Default values

A parameter can have a default, which makes that argument optional:

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Sam")            # 'Hello, Sam!'
greet("Sam", "Hi")      # 'Hi, Sam!'
```

## Keyword arguments

You can name arguments when calling. The order then stops mattering, and the call explains itself:

```python
greet(greeting="Welcome", name="Sam")
```

## Any number of arguments

`*args` collects extra positional arguments into a tuple. `**kwargs` collects extra keyword arguments into a dictionary.

```python
def total(*numbers):
    return sum(numbers)

total(1, 2, 3)     # 6
total()            # 0

def describe(**fields):
    return ", ".join(f"{k}={v}" for k, v in fields.items())

describe(name="Sam", age=30)   # 'name=Sam, age=30'
```

The star also works the other way, spreading a list out into separate arguments: `total(*[1, 2, 3])`.

## Returning several values

Return a tuple and unpack it at the call:

```python
def divide(a, b):
    return a // b, a % b

quotient, remainder = divide(17, 5)    # 3 and 2
```

A function with no `return`, or with a bare `return`, gives back `None`.

## Scope

A variable created inside a function exists only there:

```python
def f():
    x = 10
    return x

f()
print(x)      # NameError: x is not defined
```

A function can **read** variables from outside it. Assigning to a name inside a function creates a new local variable. Avoid changing outside variables from inside a function. Pass values in as arguments and return the result.

## Docstrings

A string on the first line of a function documents it. `help(clamp)` displays it, and so do editors.

```python
def clamp(x, low, high):
    """Return x, limited to the range low..high."""
    return max(low, min(x, high))
```

## Functions are values

A function can be stored in a variable, passed to another function, and returned.

```python
def shout(text):
    return text.upper() + "!"

def apply(f, value):
    return f(value)

apply(shout, "hi")     # 'HI!'
```

Many built-in tools take a function. `sorted` accepts a `key` that says what to sort by:

```python
words = ["banana", "fig", "apple"]
sorted(words, key=len)        # ['fig', 'apple', 'banana']
```

## lambda

`lambda` writes a small function in place, with no name:

```python
pairs = [("ada", 36), ("linus", 54), ("grace", 30)]
sorted(pairs, key=lambda pair: pair[1])
# [('grace', 30), ('ada', 36), ('linus', 54)]
```

A lambda holds one expression. For anything longer, use `def`.

## The mutable default trap

A default value is created **once**, when the function is defined. It is not created afresh on each call. With a list, that means every call shares the same one:

```python
def add(item, bucket=[]):      # bug
    bucket.append(item)
    return bucket

add(1)    # [1]
add(2)    # [1, 2]   the list from the first call is still there
```

The fix is to use `None` and create the list inside:

```python
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```

## Common mistakes

- **A mutable default** such as `[]` or `{}`.
- **Calling when you meant to pass.** `apply(shout, "hi")` passes the function. `apply(shout(), "hi")` calls it first, which is an error here.
- **Forgetting `return`** on one branch, so the function sometimes gives back `None`.
- **Changing a list argument.** The caller's list changes too, because both names refer to the same list. Copy it first if that is not wanted.
