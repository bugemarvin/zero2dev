# Functions that allocate

Implement the functions declared in `heap.h`. Write your code in `heap.c`.

Each function returns memory from `malloc`. The caller (the test driver) frees it. Your functions must not free what they return, and must not leak anything else.

- `int *range(int n)`: a new array holding `0, 1, ..., n - 1`. `n` is at least 1.
- `char *repeat(const char *s, int times)`: a new string made of `s` repeated `times` times. `repeat("ab", 3)` gives `"ababab"`. With `times` 0 the result is an empty string, which is still an allocated block holding just the terminator.
- `int *filter_even(const int *a, int n, int *out_n)`: a new array holding only the even elements of `a`, in the same order. Store the number of elements kept through `out_n`.

The tests run with AddressSanitizer: a write past the end of a block or a leak fails the test and shows you the line.
