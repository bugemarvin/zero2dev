#include <stdio.h>

int main(void) {
    long n;
    if (scanf("%ld", &n) != 1) {
        return 1;
    }
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    printf("%d\n", steps);
    return 0;
}
