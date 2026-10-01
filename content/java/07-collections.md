---
title: Collections
summary: Lists that grow, maps from keys to values, and sets of unique items.
---

## Why not arrays

Arrays have a fixed size. The **collections** in `java.util` grow and shrink, and come with searching, sorting and more.

| Interface | Meaning | Usual class |
| --- | --- | --- |
| `List` | ordered, allows duplicates | `ArrayList` |
| `Set` | no duplicates | `HashSet` |
| `Map` | keys mapped to values | `HashMap` |
| `Deque` | add and remove at both ends | `ArrayDeque` |

## List

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();
names.add("Ada");
names.add("Linus");
names.get(0)              // "Ada"
names.set(1, "Grace");    // replace
names.size()              // 2
names.contains("Ada")     // true
names.remove("Ada");
names.isEmpty()           // false
```

`<String>` says what the list holds. The compiler then refuses anything else, and `get` returns a `String` with no cast. The empty `<>` on the right is filled in from the left.

Declare the variable as the interface, `List`, and create the class, `ArrayList`. Code that depends only on `List` keeps working if you switch the implementation.

A quick fixed list: `List.of("a", "b", "c")`. It cannot be modified.

## Primitives need wrappers

Collections hold objects, not primitives. Use the wrapper classes, and Java converts automatically:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(5);              // the int becomes an Integer
int first = numbers.get(0);  // and back
```

| Primitive | Wrapper |
| --- | --- |
| `int` | `Integer` |
| `long` | `Long` |
| `double` | `Double` |
| `boolean` | `Boolean` |
| `char` | `Character` |

Compare wrapper objects with `.equals`, as with strings.

## Looping

```java
for (String name : names) {
    System.out.println(name);
}

for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}
```

## Map

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();
ages.put("ada", 36);
ages.put("linus", 54);
ages.get("ada")                    // 36
ages.get("bob")                    // null: not present
ages.getOrDefault("bob", 0)        // 0
ages.containsKey("ada")            // true
ages.remove("linus");
```

Counting is the classic use:

```java
Map<String, Integer> counts = new HashMap<>();
for (String word : words) {
    counts.put(word, counts.getOrDefault(word, 0) + 1);
}
```

`counts.merge(word, 1, Integer::sum)` does the same in one call.

Looping over a map:

```java
for (Map.Entry<String, Integer> entry : counts.entrySet()) {
    System.out.println(entry.getKey() + " " + entry.getValue());
}
```

A `HashMap` has **no defined order**. A `TreeMap` keeps its keys sorted. A `LinkedHashMap` keeps the order in which keys were added.

## Set

```java
import java.util.HashSet;
import java.util.Set;

Set<String> seen = new HashSet<>();
seen.add("a");         // true: it was added
seen.add("a");         // false: already present
seen.contains("a")     // true
seen.size()            // 1
```

## Sorting

```java
import java.util.Collections;
import java.util.Comparator;

Collections.sort(numbers);                       // natural order
names.sort(Comparator.naturalOrder());
names.sort(Comparator.comparing(String::length));
names.sort(Comparator.comparing(String::length).reversed());
```

A `Comparator` says how to order two items. Chain them for tie-breaks. To sort map entries by count from high to low, and by word where the counts are equal:

```java
List<Map.Entry<String, Integer>> entries = new ArrayList<>(counts.entrySet());
entries.sort(
    Map.Entry.<String, Integer>comparingByValue().reversed()
        .thenComparing(Map.Entry.comparingByKey()));
```

## Stack and queue

`ArrayDeque` serves as both:

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.pop();

Deque<Integer> queue = new ArrayDeque<>();
queue.addLast(1);
queue.pollFirst();
```

## Costs

| Operation | `ArrayList` | `HashMap`, `HashSet` |
| --- | --- | --- |
| get by index | O(1) | not applicable |
| add at the end | O(1) | O(1) |
| contains | O(n) | O(1) |
| remove from the middle | O(n) | O(1) |

## Common mistakes

- **`List<int>`.** Use `List<Integer>`.
- **`==` on `Integer` objects.** It works for small numbers by accident and fails for large ones. Use `.equals`.
- **Removing from a list while looping over it** with for-each, which throws `ConcurrentModificationException`. Use `removeIf`.
- **Relying on `HashMap` order.**
- **`list.remove(1)` on a `List<Integer>`.** It removes the element at **index** 1, not the value 1.
