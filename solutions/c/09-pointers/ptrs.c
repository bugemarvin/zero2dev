#include <stddef.h>
#include "ptrs.h"

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void min_max(const int *a, int n, int *min, int *max) {
    *min = a[0];
    *max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] < *min) {
            *min = a[i];
        }
        if (a[i] > *max) {
            *max = a[i];
        }
    }
}

int *find(int *a, int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) {
            return &a[i];
        }
    }
    return NULL;
}
