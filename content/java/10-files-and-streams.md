---
title: Files, lambdas and streams
summary: Read and write files in a few lines, and process collections by describing what you want.
---

## Files

The modern file API is in `java.nio.file`.

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

Path path = Path.of("notes.txt");

String text = Files.readString(path);               // the whole file
List<String> lines = Files.readAllLines(path);      // one string per line

Files.writeString(path, "hello\n");                 // replaces the content
Files.write(path, List.of("one", "two"));           // one line per element

Files.exists(path)                                  // true or false
```

All of these can throw `IOException`, a [checked exception](java/09-exceptions): catch it, or declare `throws IOException`.

For a file too large to hold in memory, read it lazily and close it afterwards:

```java
try (var lines = Files.lines(path)) {
    long count = lines.filter(line -> !line.isBlank()).count();
}
```

## Lambdas

A **lambda** is a short function written in place, with no name:

```java
x -> x * 2                           // one parameter
(a, b) -> a + b                      // two parameters
name -> {                            // a body with several statements
    String t = name.trim();
    return t.toUpperCase();
}
```

It can be passed wherever a single-method interface is expected:

```java
names.sort((a, b) -> a.length() - b.length());
names.removeIf(name -> name.isEmpty());
names.forEach(name -> System.out.println(name));
```

A **method reference** is shorthand for a lambda that only calls one method:

| Lambda | Method reference |
| --- | --- |
| `s -> s.toUpperCase()` | `String::toUpperCase` |
| `s -> System.out.println(s)` | `System.out::println` |
| `(a, b) -> Integer.sum(a, b)` | `Integer::sum` |

## Streams

A **stream** is a pipeline over a collection. You say **what** should happen, step by step, with no loop of your own.

```java
List<String> names = List.of("ada", "linus", "grace", "bob");

List<String> result = names.stream()
    .filter(name -> name.length() > 3)       // keep some
    .map(String::toUpperCase)                // transform each
    .sorted()                                // order
    .toList();                               // collect

// [GRACE, LINUS]
```

Compare with the pipes of the [shell](start/05-pipes-and-redirection): each stage receives the output of the one before.

A pipeline has three parts.

| Part | Examples |
| --- | --- |
| a source | `list.stream()`, `Stream.of(...)`, `IntStream.range(0, 10)`, `Files.lines(path)` |
| intermediate steps | `filter`, `map`, `sorted`, `distinct`, `limit`, `skip` |
| one terminal step | `toList`, `count`, `sum`, `collect`, `forEach`, `findFirst`, `anyMatch` |

Nothing runs until the terminal step is called. The original collection is never changed.

## Numbers

`mapToInt` gives a stream of primitive `int` values, which has `sum`, `average`, `max` and `min`:

```java
int total = numbers.stream()
    .filter(n -> n % 2 == 0)
    .mapToInt(n -> n * n)
    .sum();
```

## Collecting

```java
import java.util.stream.Collectors;

String joined = names.stream().collect(Collectors.joining(", "));

Map<Character, Long> byFirstLetter = names.stream()
    .collect(Collectors.groupingBy(name -> name.charAt(0), Collectors.counting()));

Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
```

`groupingBy` does in one line what a loop with a `HashMap` does in five.

## Optional

Some operations may have no result, such as the largest element of an empty list. They return an `Optional`: a box that either contains a value or is empty.

```java
Optional<String> longest = names.stream()
    .max(Comparator.comparing(String::length));

longest.isPresent()                 // true or false
longest.orElse("none")              // the value, or a fallback
longest.ifPresent(System.out::println);
```

An `Optional` makes "there may be nothing" visible in the method's type, where a `null` would be easy to forget.

## Streams or loops

| Use a stream when | Use a loop when |
| --- | --- |
| the task is filter, transform, collect | you need the index |
| each step is short | the body is long, or changes outside state |
| you want it to read like a description | you need to stop in complicated ways |

Neither is always better. Choose the one that the next reader will understand faster.

## Common mistakes

- **Reusing a stream.** It can be consumed once. Create a new one from the collection.
- **Forgetting the terminal step.** `names.stream().filter(...)` alone does nothing.
- **Changing outside variables from inside a lambda.** Local variables used in a lambda must not be reassigned.
- **Calling `get()` on an `Optional`** without checking. On an empty one it throws.
- **Not closing `Files.lines`.** Put it in try-with-resources.

That completes the Java track. For practice, solve the [data structures and algorithms](dsa/01-big-o) exercises in Java: `python3 check.py start dsa/01-max-of-list --lang java`.
