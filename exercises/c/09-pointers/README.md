# Pointer functions

Implement the functions declared in `ptrs.h`. Write your code in `ptrs.c`.

- `void swap(int *a, int *b)`: exchange the two values the pointers point to.
- `void min_max(const int *a, int n, int *min, int *max)`: store the smallest element of the array through `min` and the largest through `max`. `n` is at least 1.
- `int *find(int *a, int n, int target)`: return a pointer to the first element equal to `target`, or `NULL` if there is none.
