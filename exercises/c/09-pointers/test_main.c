/* Test driver. Do not edit. */
#include <stdio.h>
#include <string.h>
#include "ptrs.h"

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    int mixed[] = {3, 2, 9, 1, 5};
    int negatives[] = {-8, -2, -5};
    int one[] = {7};

    if (strcmp(test, "swap") == 0) {
        int x = 1, y = 2;
        swap(&x, &y);
        printf("%d %d\n", x, y);
        x = 9; y = -5;
        swap(&x, &y);
        printf("%d %d\n", x, y);
        x = 4; y = 4;
        swap(&x, &y);
        printf("%d %d\n", x, y);
    } else if (strcmp(test, "minmax") == 0) {
        int lo = 0, hi = 0;
        min_max(mixed, 5, &lo, &hi);
        printf("min %d max %d\n", lo, hi);
        min_max(negatives, 3, &lo, &hi);
        printf("min %d max %d\n", lo, hi);
        min_max(one, 1, &lo, &hi);
        printf("min %d max %d\n", lo, hi);
    } else if (strcmp(test, "find") == 0) {
        int *p = find(mixed, 5, 9);
        if (p != NULL) {
            printf("found %d at index %d\n", *p, (int)(p - mixed));
        } else {
            printf("9 not found\n");
        }
        int *q = find(mixed, 5, 3);
        if (q != NULL) {
            printf("found %d at index %d\n", *q, (int)(q - mixed));
        } else {
            printf("3 not found\n");
        }
        printf(find(mixed, 5, 4) == NULL ? "4 not found\n" : "4 found, but it is not there\n");
        if (p != NULL) {
            *p = 90;
        }
        printf("after writing through the pointer:");
        for (int i = 0; i < 5; i++) {
            printf(" %d", mixed[i]);
        }
        printf("\n");
    }
    return 0;
}
