# Write tests that catch bugs

This time **you** write the tests.

The function under test is `discount(price, percent)`:

- It returns `price` reduced by `percent` percent, rounded to 2 decimal places. `discount(200, 25)` is `150.0`.
- It raises `ValueError` if `price` is negative.
- It raises `ValueError` if `percent` is below 0 or above 100. Both 0 and 100 are allowed.

In `solution.py`, write test functions. Each one takes the function to test as its parameter, and its name starts with `test_`:

```python
def test_quarter_off(discount):
    assert discount(200, 25) == 150.0
```

The checker runs your tests against a correct `discount` and against **five broken versions**. You pass when:

1. every one of your tests passes on the correct version, and
2. each broken version makes at least one of your tests fail.

You are not shown the broken versions. Think about where bugs hide: the boundaries, the rounding, the invalid input.
