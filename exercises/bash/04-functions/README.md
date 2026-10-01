# A library of functions

Fill in the four functions in `lib.sh`. The file `test_lib.sh` loads your library with `source` and calls them; read it to see how.

- `is_even N` answers through its **exit code**: it succeeds when `N` is even. It prints nothing.
- `max A B` **prints** the larger of two whole numbers.
- `repeat TEXT N` prints `TEXT` repeated `N` times on one line. `repeat ab 3` prints `ababab`. With `N` of 0 it prints an empty line.
- `to_upper TEXT` prints the text in upper case.

Declare the variables you use inside a function with `local`. One test checks that your functions do not overwrite variables of the script that calls them.
