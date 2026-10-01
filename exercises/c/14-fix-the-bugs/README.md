# Fix the bugs

`main.c` is meant to read a count `n`, then `n` whole numbers, and print them in reverse order on one line followed by their sum:

```console
$ printf '5\n1 2 3 4 5\n' | ./prog
5 4 3 2 1
sum: 15
```

The program has **three bugs**. Find and fix them. Do not rewrite the program from scratch: the point is to practise reading what the compiler and the sanitizer report.

Build it the way the checker does, then run it and read the output:

```console
$ gcc -Wall -Wextra -g -fsanitize=address,undefined main.c -o prog
$ printf '5\n1 2 3 4 5\n' | ./prog
```
