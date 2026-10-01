/* Test driver. Do not edit. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "heap.h"

static void show(const int *a, int n) {
    for (int i = 0; i < n; i++) {
        printf(i == 0 ? "%d" : " %d", a[i]);
    }
    printf("\n");
}

static int check_range(int n) {
    int *r = range(n);
    if (r == NULL) {
        printf("range returned NULL\n");
        return 1;
    }
    show(r, n);
    free(r);
    return 0;
}

static int check_repeat(const char *s, int times) {
    char *r = repeat(s, times);
    if (r == NULL) {
        printf("repeat returned NULL\n");
        return 1;
    }
    printf("[%s]\n", r);
    free(r);
    return 0;
}

static int check_filter(const int *a, int n) {
    int kept = -1;
    int *r = filter_even(a, n, &kept);
    if (r == NULL) {
        printf("filter_even returned NULL\n");
        return 1;
    }
    printf("%d:", kept);
    for (int i = 0; i < kept; i++) {
        printf(" %d", r[i]);
    }
    printf("\n");
    free(r);
    return 0;
}

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    if (strcmp(test, "range") == 0) {
        return check_range(5) || check_range(1);
    }
    if (strcmp(test, "repeat") == 0) {
        return check_repeat("ab", 3) || check_repeat("x", 1) || check_repeat("abc", 0) || check_repeat("", 4);
    }
    if (strcmp(test, "filter") == 0) {
        int values[] = {4, 7, 10, 3, 8};
        int odd[] = {1, 3, 5};
        return check_filter(values, 5) || check_filter(odd, 3);
    }
    return 0;
}
