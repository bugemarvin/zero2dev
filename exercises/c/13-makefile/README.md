# Write a Makefile

Your working folder contains a small program in three files: `main.c`, `greet.c` and `greet.h`.

Write a `Makefile` there so that:

1. `make` builds a program named `app`.
2. Each `.c` file is compiled to its own `.o` file, and the two are then linked.
3. The compile commands use `-Wall`.
4. Running `make` a second time rebuilds nothing.
5. After `greet.c` changes, only `greet.o` is recompiled, not `main.o`.
6. `make clean` deletes `app` and the `.o` files.

Do not change the `.c` and `.h` files.
