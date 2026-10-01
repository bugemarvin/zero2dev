# Recursion over lists

Complete the module `Rec` in `solution.ex`, using recursion and pattern matching on `[head | tail]`.

**Do not use `Enum`, `List` or `Stream`.** The tests check for that. You are writing those functions yourself.

- `sum/1`: the sum of a list of numbers. 0 for an empty list.
- `count/1`: the number of elements.
- `reverse/1`: the list in reverse order.
- `map/2`: `map(list, fun)` returns a list with `fun` applied to each element.
- `largest/1`: the largest element, or `nil` for an empty list.

`reverse/1` must be fast on a list of 200,000 elements, so do not append with `++` at each step. Use an accumulator.
