# Count words by prefix

**Input:** the first line holds `n` and `q`. Then `n` lower-case words, then `q` lower-case prefixes, all separated by spaces or newlines.

**Output:** for each prefix, on its own line, how many of the words start with it. A word counts as starting with itself. If the same word appears twice in the list, it counts twice.

```text
input                  output
5 4                    3
car card care cat dog  4
car ca d x             1
                       0
```

`car`, `card` and `care` start with `car`. Four words start with `ca`.

One test has 30,000 words and 3,000 prefixes. Checking every word against every prefix is too slow. Build a trie in which every node counts the words that pass through it.
