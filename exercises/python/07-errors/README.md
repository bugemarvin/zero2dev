# Handle and raise errors

Write three functions in `solution.py`.

`safe_divide(a, b)` returns `a / b`, or `None` when `b` is zero. Catch the exception; do not test `b` with an `if`.

`parse_age(text)` converts a string to an integer age and returns it.

- If the text is not a whole number, it raises `ValueError`.
- If the number is below 0 or above 150, it raises `ValueError` with the message `age out of range`.

`first_valid(items)` takes a list of strings and returns the first one that can be converted to an integer, as an integer. If none can, it returns `None`.

```python
first_valid(["x", "12", "7"])    # 12
```
