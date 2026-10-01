#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) {
        return 1;
    }
    long best = 0;
    for (int i = 0; i < n; i++) {
        long x;
        if (scanf("%ld", &x) != 1) {
            return 1;
        }
        if (i == 0 || x > best) {
            best = x;
        }
    }
    printf("%ld\n", best);
    return 0;
}
