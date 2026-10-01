# Functions with types

Write five functions in `solution.php`. Give every parameter and return value a type.

- `grade(int $score): string` returns `"A"` from 90, `"B"` from 80, `"C"` from 70 and `"F"` below. A score outside 0 to 100 throws an `InvalidArgumentException` with the message `score out of range`.
- `initials(string $fullName): string` returns the first letter of each word, in upper case. `"ada lovelace"` gives `"AL"`.
- `apply_discount(float $price, float $percent = 10.0): float` returns the price reduced by the percentage, rounded to 2 decimals.
- `make_counter(int $start = 0): callable` returns a closure. Each call of the closure returns the next number: `$start`, then `$start + 1`, and so on. Each counter is independent.
- `sum_all(int ...$numbers): int` returns the sum of all its arguments, and 0 with none.
