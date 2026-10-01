# Count words

Write two functions in `solution.py`.

`word_count(text)` returns a dictionary that maps each word to how many times it appears. Words are separated by spaces. Upper and lower case count as the same word, and the keys are lower case.

```python
word_count("the cat and the hat")
# {'the': 2, 'cat': 1, 'and': 1, 'hat': 1}
```

`most_common(text)` returns the word that appears most often. If several words share the highest count, return the one that comes first alphabetically. For text with no words, return `None`.
