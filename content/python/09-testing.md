---
title: Testing
summary: Write code that checks your code, so you can change things without fear.
---

## Why test

You already test: you run the program and look at the output. An automated test does the same check, the same way, every time, in milliseconds. That means:

- you find out at once when a change breaks something that used to work;
- you can restructure code and know it still behaves the same;
- the tests show how the code is meant to be used.

The checker you have been running is exactly this: tests written in advance.

## assert

`assert` checks that something is true. If it is not, the program stops with an `AssertionError`.

```python
def add(a, b):
    return a + b

assert add(2, 3) == 5
assert add(-1, 1) == 0, "adding opposites should give zero"
```

The optional text after the comma is shown when the assertion fails.

## Test functions

Put each check in its own function with a name starting with `test_`. One test, one behaviour.

```python
# test_cart.py
from cart import total

def test_empty_cart_is_zero():
    assert total([]) == 0

def test_sums_prices():
    assert total([2.50, 1.25]) == 3.75
```

**pytest**, the most widely used test runner, finds and runs these with no extra code. Install it in a [virtual environment](python/06-modules-and-venv):

```console
(.venv) $ python -m pip install pytest
(.venv) $ pytest
test_cart.py ..                                    [100%]
2 passed in 0.01s
```

When a test fails, pytest shows the values on both sides of the comparison.

## Testing that errors are raised

A function that rejects bad input should be tested for that too:

```python
import pytest

def test_negative_price_is_rejected():
    with pytest.raises(ValueError):
        total([-1])
```

Without pytest, the same check is:

```python
def test_negative_price_is_rejected():
    try:
        total([-1])
    except ValueError:
        return                # the expected error happened
    assert False, "expected a ValueError"
```

## What to test

Bugs gather at the edges. For any function, ask what happens with:

| Kind of input | Examples |
| --- | --- |
| the normal case | a typical value |
| empty | `[]`, `""`, `0`, `None` |
| one element | a list with a single item |
| boundaries | the first and last valid values, and the values just outside them |
| invalid input | negative numbers, the wrong type |
| duplicates and ties | two equal items |

If a rule says "between 0 and 100", then test 0, 100, -1 and 101. An off-by-one mistake shows up at exactly those four values and nowhere else.

## Good tests

- **Small and focused.** When one fails, its name should tell you what broke.
- **Independent.** No test relies on another having run first.
- **Repeatable.** No dependence on the clock, the network, or random numbers.
- **Checking behaviour**, not how the function is written inside.

## Floating point

Decimal fractions are not stored exactly:

```python
0.1 + 0.2 == 0.3          # False
```

Compare with a tolerance:

```python
import math
math.isclose(0.1 + 0.2, 0.3)      # True
```

## Test first

A useful routine, especially for fixing bugs:

1. Write a test that fails because of the bug.
2. Fix the code until the test passes.
3. Keep the test. The bug cannot return unnoticed.

## The standard library option

Python includes `unittest`, which needs nothing installed. Tests are methods of a class:

```python
import unittest
from cart import total

class TestTotal(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(total([]), 0)

if __name__ == "__main__":
    unittest.main()
```

## Common mistakes

- **Testing only the happy path.** The normal case is the least likely to be broken.
- **One giant test** that checks ten things. The first failure hides the other nine.
- **Tests that never fail.** A test that would still pass with the function body deleted checks nothing. Break the code on purpose once, and watch the test catch it.
- **Comparing floats with `==`.**
