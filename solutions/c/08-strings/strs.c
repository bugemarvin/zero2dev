#include "strs.h"

int my_strlen(const char s[]) {
    int n = 0;
    while (s[n] != '\0') {
        n++;
    }
    return n;
}

int count_char(const char s[], char c) {
    int count = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] == c) {
            count++;
        }
    }
    return count;
}

void to_upper(char s[]) {
    for (int i = 0; s[i] != '\0'; i++) {
        if (s[i] >= 'a' && s[i] <= 'z') {
            s[i] = s[i] - 'a' + 'A';
        }
    }
}

int is_palindrome(const char s[]) {
    int n = my_strlen(s);
    for (int i = 0; i < n / 2; i++) {
        if (s[i] != s[n - 1 - i]) {
            return 0;
        }
    }
    return 1;
}
