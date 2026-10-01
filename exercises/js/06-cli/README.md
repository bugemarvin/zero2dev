# A word counter for the command line

Write `wc.mjs`, a small version of the `wc` command.

```console
$ node wc.mjs notes.txt
2 5 25
```

It takes one file name and prints three numbers separated by spaces: the number of lines (count the newline characters), the number of words (separated by any whitespace), and the number of characters.

- If the file does not exist, print a message to standard error and exit with code 1.
- With no argument, print a usage message to standard error and exit with code 2.

In both error cases nothing goes to standard output.
