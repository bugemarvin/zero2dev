#include <stdio.h>

int main(void) {
    int width, height;
    if (scanf("%d %d", &width, &height) != 2) {
        return 1;
    }
    printf("area: %d\n", width * height);
    printf("perimeter: %d\n", 2 * (width + height));
    return 0;
}
