# Write generators

Write four functions in `solution.py`. The first three must be generators: they use `yield` and produce values one at a time.

- `countdown(n)` yields `n, n - 1, ..., 1`. For `n` of 0 or less it yields nothing.
- `fibonacci()` yields the Fibonacci numbers for ever: `0, 1, 1, 2, 3, 5, 8, ...`
- `chunks(items, size)` yields lists of `size` consecutive items. The last list may be shorter. It must work on any iterable, including another generator, and must not load everything into memory first.
- `take(n, iterable)` returns a **list** of the first `n` values of any iterable. It must stop asking for values after `n`, so that it works on an endless generator.

```python
list(countdown(3))               # [3, 2, 1]
take(6, fibonacci())             # [0, 1, 1, 2, 3, 5]
list(chunks([1, 2, 3, 4, 5], 2)) # [[1, 2], [3, 4], [5]]
```
