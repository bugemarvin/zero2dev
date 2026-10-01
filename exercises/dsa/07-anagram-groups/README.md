# Group anagrams

Two words are anagrams when one can be made by rearranging the letters of the other: `listen` and `silent`.

**Input:** the first line holds `n`. Then `n` lower-case words, separated by spaces or newlines.

**Output:** two numbers: how many groups of anagrams there are, and the size of the largest group. A word with no anagram partner is a group of one.

```text
input                          output
6                              3 3
eat tea tan ate nat bat
```

The groups are {eat, tea, ate}, {tan, nat} and {bat}.
