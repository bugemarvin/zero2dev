# Streams, Optional and a file

Complete the static methods in `Stats.java`. Each fits in a single stream pipeline.

- `List<String> longNames(List<String> names, int minLength)`: the names with at least `minLength` characters, converted to upper case, in alphabetical order.
- `int sumOfEvenSquares(List<Integer> numbers)`: the sum of the squares of the even numbers.
- `Map<Character, Long> countByFirstLetter(List<String> words)`: for each first letter, in lower case, the number of words that start with it. Empty strings are skipped.
- `Optional<String> longest(List<String> words)`: the longest word, or an empty `Optional` for an empty list. If several are equally long, the first of them.
- `long countNonBlankLines(Path path) throws IOException`: the number of lines in the file that contain something other than spaces.

```java
Stats.longNames(List.of("ada", "linus", "grace"), 5);   // [GRACE, LINUS]
Stats.sumOfEvenSquares(List.of(1, 2, 3, 4));            // 20
Stats.longest(List.of("a", "ccc", "bb"));               // Optional[ccc]
```
