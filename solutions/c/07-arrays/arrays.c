#include "arrays.h"

long sum_of(const int a[], int n) {
    long total = 0;
    for (int i = 0; i < n; i++) {
        total += a[i];
    }
    return total;
}

int max_of(const int a[], int n) {
    int best = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > best) {
            best = a[i];
        }
    }
    return best;
}

int count_even(const int a[], int n) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            count++;
        }
    }
    return count;
}

void reverse(int a[], int n) {
    for (int i = 0; i < n / 2; i++) {
        int tmp = a[i];
        a[i] = a[n - 1 - i];
        a[n - 1 - i] = tmp;
    }
}
