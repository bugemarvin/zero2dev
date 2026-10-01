/* Test driver. Do not edit. */
#include <stdio.h>
#include <string.h>
#include "strs.h"

int main(int argc, char *argv[]) {
    const char *test = argc > 1 ? argv[1] : "";
    if (strcmp(test, "len") == 0) {
        printf("%d\n", my_strlen("hello"));
        printf("%d\n", my_strlen(""));
        printf("%d\n", my_strlen("hello world"));
    } else if (strcmp(test, "count") == 0) {
        printf("%d\n", count_char("banana", 'a'));
        printf("%d\n", count_char("banana", 'z'));
        printf("%d\n", count_char("a b c", ' '));
    } else if (strcmp(test, "upper") == 0) {
        char a[] = "Hello, world 42!";
        char b[] = "";
        char c[] = "abc";
        to_upper(a);
        to_upper(b);
        to_upper(c);
        printf("%s\n%s\n%s\n", a, b, c);
    } else if (strcmp(test, "palindrome") == 0) {
        const char *words[] = {"racecar", "abba", "abca", "a", "", "ab"};
        for (int i = 0; i < 6; i++) {
            printf("%s %d\n", words[i][0] ? words[i] : "(empty)", is_palindrome(words[i]));
        }
    }
    return 0;
}
