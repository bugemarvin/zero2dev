# Roman numerals

A final exercise that puts pattern matching and recursion to work. Open `tests.exs` first and read the tests: they are the specification.

Write the module `Roman` in `solution.ex`.

- `Roman.to_roman(n)` converts an integer from 1 to 3999 to a Roman numeral string.
- `Roman.from_roman(text)` converts a Roman numeral string back to an integer.

| Value | Numeral | | Value | Numeral |
| --- | --- | --- | --- | --- |
| 1000 | M | | 40 | XL |
| 900 | CM | | 10 | X |
| 500 | D | | 9 | IX |
| 400 | CD | | 5 | V |
| 100 | C | | 4 | IV |
| 90 | XC | | 1 | I |
| 50 | L | | | |

`to_roman(1994)` is `"MCMXCIV"`: 1000 + 900 + 90 + 4.

For `to_roman`, repeatedly take the largest value in the table that still fits. For `from_roman`, read the text from the left: a letter that is smaller than the one after it is subtracted, as in `IV`.

You can run the tests directly as well: `elixir -r solution.ex tests.exs`
