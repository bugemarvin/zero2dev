/* Test driver. Do not edit. */
#include <stdio.h>
#include <string.h>
#include "arrays.h"

static void show(const char *label, const int a[], int n) {
    printf("%s:", label);
    for (int i = 0; i < n; i++) {
        printf(" %d", a[i]);
    }
    printf("\n");
}

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    int mixed[] = {3, 2, 9, 1, 5};
    int negatives[] = {-8, -2, -5};
    int one[] = {7};
    int big[] = {2000000000, 2000000000, 2000000000};

    if (strcmp(test, "sum") == 0) {
        printf("sum = %ld\n", sum_of(mixed, 5));
        printf("sum of one = %ld\n", sum_of(one, 1));
        printf("sum of none = %ld\n", sum_of(mixed, 0));
        printf("big sum = %ld\n", sum_of(big, 3));
    } else if (strcmp(test, "max") == 0) {
        printf("max = %d\n", max_of(mixed, 5));
        printf("max of negatives = %d\n", max_of(negatives, 3));
        printf("max of one = %d\n", max_of(one, 1));
    } else if (strcmp(test, "even") == 0) {
        int values[] = {4, 7, 10, 3, 1};
        printf("even = %d\n", count_even(values, 5));
        printf("even of none = %d\n", count_even(values, 0));
    } else if (strcmp(test, "reverse") == 0) {
        int four[] = {1, 2, 3, 4};
        reverse(mixed, 5);
        show("5 odd", mixed, 5);
        reverse(four, 4);
        show("4 even", four, 4);
        reverse(one, 1);
        show("1", one, 1);
    }
    return 0;
}
