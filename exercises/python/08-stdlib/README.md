# Use the standard library

Write three functions in `solution.py`. Each one is a few lines when you import the right module.

- `days_between(first, second)` takes two dates as text in the form `YYYY-MM-DD` and returns the number of days between them. The result is never negative, whichever date is earlier. Use `datetime`.
- `top_words(words, n)` returns the `n` most frequent words as a list of `(word, count)` pairs, most frequent first. Words with equal counts are ordered alphabetically. Use `collections`.
- `hypotenuse(a, b)` returns the length of the longest side of a right-angled triangle whose other sides are `a` and `b`. Use `math`.

```python
days_between("2025-01-01", "2025-03-01")     # 59
top_words(["a", "b", "a", "c", "b", "a"], 2) # [('a', 3), ('b', 2)]
hypotenuse(3, 4)                             # 5.0
```
