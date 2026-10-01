# Count lines, words and characters

Write a small version of the `wc` command in `main.c`.

The program takes one argument, a file name, and prints three numbers separated by single spaces:

1. the number of lines (count the newline characters),
2. the number of words (runs of characters separated by spaces, tabs or newlines),
3. the number of characters.

```console
$ ./wc notes.txt
2 5 22
```

If the file cannot be opened, or no argument is given, print a message to **standard error** and exit with code 1. Print nothing to standard output in that case.
