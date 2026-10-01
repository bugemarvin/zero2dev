# Word frequencies

Write a program in `Main.java` that reads text from standard input and prints how often each word occurs.

- Words are separated by spaces or newlines.
- Upper and lower case count as the same word. Print the words in lower case.
- Print one line per word: the word, a space, its count.
- Order the lines by count, highest first. Words with the same count are ordered alphabetically.

```console
$ echo "the cat and the hat and the bat" | java Main
the 3
and 2
bat 1
cat 1
hat 1
```
