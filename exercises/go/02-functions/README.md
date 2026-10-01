# Functions and loops

Write four functions in `solution.go`.

- `Grade(score int) string` returns `"A"` for 90 and above, `"B"` for 80 to 89, `"C"` for 70 to 79, and `"F"` below 70.
- `SumTo(n int) int` returns 1 + 2 + ... + n. For `n` of 0 or less it returns 0.
- `IsPrime(n int) bool` says whether `n` is a prime number. Numbers below 2 are not prime.
- `Divide(a, b int) (int, error)` returns `a / b`. When `b` is 0 it returns `0` and an error whose message is `division by zero`.
