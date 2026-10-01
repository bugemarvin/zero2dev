# Flexible functions

Write four functions in `solution.py`.

- `clamp(x, low=0, high=100)` returns `x` limited to the range from `low` to `high`. The two limits are optional.
- `average(*numbers)` accepts any number of arguments and returns their average as a float. With no arguments it returns `0.0`.
- `min_max(numbers)` returns two values: the smallest and the largest element of a non-empty list.
- `apply_twice(f, x)` calls the function `f` on `x`, then calls `f` again on the result, and returns that.

```python
clamp(150)                       # 100
clamp(7, 10, 20)                 # 10
average(2, 4, 9)                 # 5.0
low, high = min_max([3, 9, 1])   # 1 and 9
apply_twice(str.upper, "hi")     # 'HI'
```
