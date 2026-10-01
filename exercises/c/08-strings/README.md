# String functions

Implement the functions declared in `strs.h`. Write your code in `strs.c`. Do not call the library's `strlen`: write the loop yourself.

- `int my_strlen(const char s[])`: the number of characters before the terminator.
- `int count_char(const char s[], char c)`: how many times `c` appears in `s`.
- `void to_upper(char s[])`: change every lower-case letter to upper case, in place. Other characters stay as they are.
- `int is_palindrome(const char s[])`: 1 if `s` reads the same forwards and backwards, 0 otherwise. The empty string is a palindrome.
