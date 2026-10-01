#include <stdio.h>

int main(void) {
    int a, b, c;
    if (scanf("%d %d %d", &a, &b, &c) != 3) {
        return 1;
    }
    printf("average: %.2f\n", (a + b + c) / 3.0);
    return 0;
}
