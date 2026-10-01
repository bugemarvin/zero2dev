# Take data apart

Complete the module `Match` in `solution.ex`. Use pattern matching in the function heads: write several clauses of the same function. You should not need `if`.

- `swap/1` takes a two-element tuple and returns it with the elements exchanged: `swap({1, 2})` is `{2, 1}`
- `first/1` takes a list and returns `{:ok, element}` with its first element, or `:error` for an empty list
- `second/1` returns the second element of a list, or `nil` if the list has fewer than two elements
- `describe/1` takes a result tuple: `describe({:ok, 5})` is `"ok: 5"` and `describe({:error, "boom"})` is `"error: boom"`. Anything else gives `"unknown"`.
- `area/1` takes a shape: `{:circle, radius}`, `{:rect, width, height}` or `{:square, side}`. Use `3.14` for pi.
