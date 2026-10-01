#include <stdlib.h>
#include <string.h>
#include "heap.h"

int *range(int n) {
    int *a = malloc(n * sizeof(int));
    if (a == NULL) {
        return NULL;
    }
    for (int i = 0; i < n; i++) {
        a[i] = i;
    }
    return a;
}

char *repeat(const char *s, int times) {
    size_t len = strlen(s);
    char *out = malloc(len * times + 1);
    if (out == NULL) {
        return NULL;
    }
    for (int i = 0; i < times; i++) {
        memcpy(out + i * len, s, len);
    }
    out[len * times] = '\0';
    return out;
}

int *filter_even(const int *a, int n, int *out_n) {
    int *out = malloc((n > 0 ? n : 1) * sizeof(int));
    if (out == NULL) {
        return NULL;
    }
    int kept = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            out[kept++] = a[i];
        }
    }
    *out_n = kept;
    return out;
}
