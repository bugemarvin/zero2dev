# Arrays and text

Complete the static methods in `TextUtil.java`.

- `boolean isPalindrome(String s)`: whether `s` reads the same in both directions, ignoring upper and lower case and ignoring every character that is not a letter or a digit. `"A man, a plan, a canal: Panama"` is a palindrome. So is the empty string.
- `int countVowels(String s)`: how many of the characters are `a`, `e`, `i`, `o` or `u`, in either case.
- `String capitalize(String sentence)`: the sentence with the first letter of each word in upper case. Words are separated by single spaces. `"hello big world"` becomes `"Hello Big World"`.
- `int[] rotate(int[] a, int k)`: a **new** array with the elements moved `k` places to the right, wrapping around. `rotate({1, 2, 3, 4, 5}, 2)` is `{4, 5, 1, 2, 3}`. `k` is zero or more and may be larger than the length. The array passed in must not change.
