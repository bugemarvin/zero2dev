# Parsing with Option and Result

Write the following in `solution.rs`. Everything is `pub`.

## `find_user`

`find_user(names: &[&str], wanted: &str) -> Option<usize>` returns the position of `wanted` in the list, or `None`.

## `ParseError`

An enum that derives `Debug` and `PartialEq`, with three variants:

- `Empty`
- `NotANumber(String)`: holds the text that could not be parsed
- `OutOfRange(i64)`: holds the number

## `parse_percent`

`parse_percent(text: &str) -> Result<u8, ParseError>` turns text into a percentage from 0 to 100.

- Spaces around the text are ignored: `" 42 "` gives `Ok(42)`.
- An empty text (after trimming) gives `Err(ParseError::Empty)`.
- Text that is not a whole number gives `Err(ParseError::NotANumber(...))` holding the trimmed text.
- A number below 0 or above 100 gives `Err(ParseError::OutOfRange(n))`.

Parse as `i64` first, then check the range.

## `average_percent`

`average_percent(texts: &[&str]) -> Result<f64, ParseError>` parses every text with `parse_percent` and returns the average. The first error is returned as it is: use `?`. An empty list gives `Err(ParseError::Empty)`.
