# Array functions

Implement the functions declared in `arrays.h`. Write your code in `arrays.c`.

- `long sum_of(const int a[], int n)`: the sum of the `n` elements. 0 when `n` is 0.
- `int max_of(const int a[], int n)`: the largest element. `n` is at least 1.
- `int count_even(const int a[], int n)`: how many elements are even.
- `void reverse(int a[], int n)`: reverse the array in place.

Every function gets the length as a second argument, because an array does not know its own length. Never read or write outside indexes `0` to `n - 1`: the tests run with AddressSanitizer.
