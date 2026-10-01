# Pipelines with iterators

Write five functions in `solution.rs`, each `pub`. Use iterator adapters such as `filter`, `map`, `sum` and `collect`.

- `sum_of_even_squares(numbers: &[i64]) -> i64`: keep the even numbers, square them, add them up.
- `initials(names: &[&str]) -> String`: the first character of each name, in upper case, joined together. Empty names are skipped. `["ada", "linus"]` gives `"AL"`.
- `long_words(text: &str, min: usize) -> Vec<String>`: the words with at least `min` characters, in lower case, in their original order.
- `apply_n<F: Fn(i64) -> i64>(f: F, times: u32, start: i64) -> i64`: applies `f` to `start`, `times` times in a row. `apply_n(|x| x * 2, 3, 1)` is 8.
- `running_total(numbers: &[i64]) -> Vec<i64>`: the sum so far at each position. `[1, 2, 3]` gives `[1, 3, 6]`.
