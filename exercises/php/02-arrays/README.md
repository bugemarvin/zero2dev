# Working with arrays

Write four functions in `solution.php`.

- `word_counts(string $text): array` returns how often each word occurs, as an array with the words (in lower case) as keys, sorted **by key**. Words are separated by whitespace. An empty text gives an empty array.
- `average(array $numbers): float` returns the average, and `0.0` for an empty array.
- `top_scorers(array $scores, int $limit): array` receives an array such as `["ada" => 91, "sam" => 78]` and returns the **names** of the `$limit` highest scores, highest first, as a plain list. Equal scores are in alphabetical order of name.
- `only_adults(array $people): array` receives a list of arrays with the keys `name` and `age`, and returns the names of those aged 18 or more, as a plain list with the keys 0, 1, 2, ...
