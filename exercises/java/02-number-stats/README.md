# Statistics of the input

Write a program in `Main.java` that reads whole numbers from standard input until the input ends. The numbers are separated by spaces or newlines.

Print four lines:

```console
$ echo "3 9 -2 7 4" | java Main
count: 5
sum: 21
min: -2
max: 9
```

If there are no numbers at all, print only `count: 0`.

Each number fits in an `int`, but their sum may not.
