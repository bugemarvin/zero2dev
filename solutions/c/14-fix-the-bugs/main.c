#include <stdio.h>
#include <stdlib.h>

/* Returns a new array holding the n values of a in reverse order.
   The caller frees it. */
int *reversed(const int *a, int n) {
    int *out = malloc((n + 1) * sizeof(int));
    for (int i = 0; i < n; i++) {
        out[i] = a[n - 1 - i];
    }
    return out;
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 0) {
        return 1;
    }
    int *a = malloc((n > 0 ? n : 1) * sizeof(int));
    for (int i = 0; i < n; i++) {
        if (scanf("%d", &a[i]) != 1) {
            free(a);
            return 1;
        }
    }

    int *r = reversed(a, n);
    long sum = 0;
    for (int i = 0; i < n; i++) {
        printf(i == 0 ? "%d" : " %d", r[i]);
        sum += r[i];
    }
    printf("\nsum: %ld\n", sum);

    free(a);
    free(r);
    return 0;
}
