---
title: Errors and exceptions
summary: Read a traceback, catch the errors you can handle, and raise your own when input is wrong.
---

## Reading a traceback

When something goes wrong, Python stops and prints a traceback:

```text
Traceback (most recent call last):
  File "shop.py", line 9, in <module>
    print(total(prices))
  File "shop.py", line 4, in total
    result += float(p)
ValueError: could not convert string to float: 'abc'
```

**Read it from the bottom.** The last line gives the type of error and a message. The lines above show the route: `total` was called from line 9, and the failure happened on line 4.

| Exception | Usual cause |
| --- | --- |
| `NameError` | a misspelled or undefined name |
| `TypeError` | the wrong kind of value, like `"a" + 1` |
| `ValueError` | the right type with an unusable value, like `int("abc")` |
| `IndexError` | a list index past the end |
| `KeyError` | a dictionary key that is not there |
| `ZeroDivisionError` | dividing by zero |
| `FileNotFoundError` | opening a file that does not exist |
| `AttributeError` | calling a method on the wrong type, often on `None` |

## Catching

```python
try:
    age = int(text)
except ValueError:
    print("That is not a number")
```

If the code in `try` raises a `ValueError`, Python jumps to the `except` block. Any other exception passes through untouched.

The full form:

```python
try:
    f = open(path, encoding="utf-8")
except FileNotFoundError:
    print("no such file")
else:
    print(f.read())      # runs only if no exception happened
    f.close()
finally:
    print("done")        # runs in every case
```

Catch several types with a tuple, and get hold of the exception object with `as`:

```python
try:
    value = data[key] / count
except (KeyError, ZeroDivisionError) as exc:
    print(f"could not compute: {exc}")
```

## Catch only what you can handle

```python
try:
    do_work()
except Exception:      # bad: hides every bug, including typos
    pass
```

A broad `except` that does nothing makes bugs invisible. Catch the specific exception you expect. Let everything else stop the program with a traceback, because that traceback is how you find the bug.

## Raising

When your function is given something it cannot work with, raise an exception. Do not return a made-up value.

```python
def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age
```

Choose the type that fits: `ValueError` for a bad value, `TypeError` for the wrong type.

## Your own exception types

```python
class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"need {amount}, have {balance}")
    return balance - amount
```

A named type lets callers catch exactly this problem and nothing else.

## Ask forgiveness, not permission

Two ways to handle a key that may be missing:

```python
# check first
if "name" in user:
    name = user["name"]
else:
    name = "unknown"

# just try
try:
    name = user["name"]
except KeyError:
    name = "unknown"
```

Python code often prefers the second style when failure is rare. For this particular case `user.get("name", "unknown")` beats both.

## Common mistakes

- **A bare `except:` or `except Exception: pass`.** It hides real bugs.
- **Catching too early.** If a function cannot do anything useful about an error, let it travel up to code that can.
- **Returning `None` or `-1` to signal an error.** Callers forget to check. Raise.
- **Reading the traceback from the top.** The answer is on the last line.
