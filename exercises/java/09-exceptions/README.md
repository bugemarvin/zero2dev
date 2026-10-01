# Parse with your own exception

## `InvalidAgeException`

Make it a **checked** exception: it extends `Exception`, not `RuntimeException`. It has a constructor that takes a message.

## `Parser`

`static int parseAge(String text) throws InvalidAgeException`

- Returns the age as an `int`. Spaces around the number are allowed.
- If the text is not a whole number, it throws `InvalidAgeException` with a message that contains `not a number`.
- If the number is below 0 or above 150, it throws `InvalidAgeException` with a message that contains `out of range`.

`static int sumValid(List<String> items)`

- Returns the sum of all the items that are valid whole numbers, after trimming spaces. Items that are not numbers are skipped. It never throws.

```java
Parser.parseAge(" 42 ");                          // 42
Parser.parseAge("abc");                           // throws InvalidAgeException: not a number: abc
Parser.sumValid(List.of("1", "x", " 3 ", ""));    // 4
```
