---
title: Arrays and strings
summary: Fixed-size arrays, the loops that go with them, and efficient work with text.
---

## Arrays

An array holds a fixed number of values of one type.

```java
int[] scores = {90, 72, 85};
int[] counts = new int[5];        // five zeros
String[] names = new String[3];   // three nulls
```

```java
scores[0]          // 90: indexes start at 0
scores[2] = 88;    // change an element
scores.length      // 3: a field, with no brackets
```

The size cannot change after creation. For a list that grows, use an `ArrayList`, covered in [collections](java/07-collections).

Java checks every index. Going outside the array stops the program with an `ArrayIndexOutOfBoundsException`, which names the bad index and the line.

## Looping

```java
for (int i = 0; i < scores.length; i++) {
    System.out.println(i + ": " + scores[i]);
}

for (int score : scores) {          // for-each: when the index is not needed
    System.out.println(score);
}
```

The for-each loop gives you a copy of each element. Assigning to `score` does not change the array.

## Helpers in java.util.Arrays

```java
import java.util.Arrays;

Arrays.toString(scores)            // "[90, 72, 85]"
Arrays.sort(scores);               // sorts in place
Arrays.fill(counts, 7);            // every element becomes 7
int[] copy = Arrays.copyOf(scores, scores.length);
Arrays.equals(scores, copy)        // true: same contents
```

Printing an array directly gives something like `[I@1b6d3586`. Use `Arrays.toString`.

`scores == copy` is false. As with strings, `==` asks whether they are the same object.

## Arrays are references

```java
int[] a = {1, 2, 3};
int[] b = a;          // no copy: both names refer to one array
b[0] = 99;
System.out.println(a[0]);    // 99
```

Make a real copy with `Arrays.copyOf` or `a.clone()`.

## Two dimensions

```java
int[][] grid = new int[3][4];     // 3 rows, 4 columns
grid[1][2] = 5;
grid.length        // 3
grid[0].length     // 4
```

## Strings, character by character

```java
String word = "level";
for (int i = 0; i < word.length(); i++) {
    char c = word.charAt(i);
}

for (char c : word.toCharArray()) {
}
```

A `char` is a number underneath, so characters can be compared and adjusted:

```java
char c = 'b';
c >= 'a' && c <= 'z'               // true
Character.isLetter(c)              // true
Character.isDigit('7')             // true
Character.toUpperCase(c)           // 'B'
```

## Useful string methods

```java
"a,b,c".split(",")                 // {"a", "b", "c"}
"  hi  ".trim()                    // "hi"
"Hello".toLowerCase()              // "hello"
"hello".indexOf("l")               // 2, or -1 if absent
"hello".replace("l", "L")          // "heLLo"
String.join("-", "a", "b", "c")    // "a-b-c"
"".isEmpty()                       // true
"a b  c".split("\\s+")             // split on any run of whitespace
```

## StringBuilder

Strings cannot be changed, so `s = s + x` builds a brand-new string each time. Inside a loop that copying adds up to O(n²). A `StringBuilder` is a changeable buffer made for this:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 5; i++) {
    sb.append(i).append(' ');
}
String result = sb.toString().trim();     // "0 1 2 3 4"
```

It can also reverse: `new StringBuilder("abc").reverse().toString()` is `"cba"`.

## null

A variable of an object type can hold `null`, meaning it refers to nothing. Calling a method on it throws a `NullPointerException`:

```java
String s = null;
s.length();        // NullPointerException
```

A new `String[3]` contains three nulls until you assign to it.

## Common mistakes

- **`length` for arrays, `length()` for strings, `size()` for lists.**
- **`<=` in the loop condition**, which runs one index too far.
- **`==` to compare arrays or strings.**
- **Assigning one array to another** and expecting a copy.
- **Building a long string with `+` in a loop.**
