# Enum and pipelines

Complete the module `Pipes` in `solution.ex`. Each function is a short pipeline of `String` and `Enum` calls.

- `sum_of_even_squares/1`: the sum of the squares of the even numbers in a list. `sum_of_even_squares([1, 2, 3, 4])` is `20`.
- `initials/1`: the upper-case first letters of each word in a name. `initials("ada lovelace")` is `"AL"`.
- `word_frequencies/1`: a map from each word of a text, in lower case, to how often it occurs. Words are separated by whitespace.
- `top_words/2`: `top_words(text, n)` returns the `n` most frequent words as a list of `{word, count}` tuples, most frequent first. Words with the same count are in alphabetical order.

```elixir
Pipes.word_frequencies("The cat the hat")
# %{"the" => 2, "cat" => 1, "hat" => 1}

Pipes.top_words("b a b a c", 2)
# [{"a", 2}, {"b", 2}]
```
