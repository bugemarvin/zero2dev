/* Test driver. Do not edit. */
#include <stdio.h>
#include <string.h>
#include "mathx.h"

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    if (strcmp(test, "gcd") == 0) {
        printf("gcd(12, 18) = %d\n", gcd(12, 18));
        printf("gcd(17, 5) = %d\n", gcd(17, 5));
        printf("gcd(100, 10) = %d\n", gcd(100, 10));
        printf("gcd(7, 0) = %d\n", gcd(7, 0));
    } else if (strcmp(test, "prime") == 0) {
        printf("primes up to 30:");
        for (int i = 0; i <= 30; i++) {
            if (is_prime(i)) {
                printf(" %d", i);
            }
        }
        printf("\n");
        printf("is_prime(1) = %d\n", is_prime(1));
        printf("is_prime(0) = %d\n", is_prime(0));
        printf("is_prime(-7) = %d\n", is_prime(-7));
        printf("is_prime(97) = %d\n", is_prime(97));
        printf("is_prime(91) = %d\n", is_prime(91));
    } else if (strcmp(test, "factorial") == 0) {
        int values[] = {0, 1, 5, 10, 20};
        for (int i = 0; i < 5; i++) {
            printf("%d! = %ld\n", values[i], factorial(values[i]));
        }
    } else if (strcmp(test, "fib") == 0) {
        for (int i = 0; i <= 10; i++) {
            printf(i == 0 ? "%d" : " %d", fib(i));
        }
        printf("\n");
        printf("fib(40) = %d\n", fib(40));
    }
    return 0;
}
