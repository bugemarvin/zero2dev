# Clauses, guards and functions as values

Complete the module `Calc` in `solution.ex`.

- `sign/1`: `:positive`, `:negative` or `:zero` for a number. Use guards.
- `fizzbuzz/1`: for a positive integer, `"FizzBuzz"` if it is divisible by 15, `"Fizz"` if by 3, `"Buzz"` if by 5, and otherwise the number as a string, such as `"7"`. Use guards with `rem`.
- `greet/2`: `greet("Sam")` is `"Hello, Sam!"` and `greet("Sam", "Hi")` is `"Hi, Sam!"`. The greeting is a default argument.
- `apply_n/3`: `apply_n(fun, n, value)` applies the function `n` times, feeding each result into the next call. `apply_n(fn x -> x * 2 end, 3, 1)` is `8`. With `n` of 0 it returns the value unchanged.
- `compose/2`: `compose(f, g)` returns a **new function** that applies `f` first and then `g` to the result.
