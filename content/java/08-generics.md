---
title: Generics
summary: Write a class or method once and use it safely with any type.
---

## The problem

Suppose you write a stack of integers. Next week you need a stack of strings. Copying the class for every type is not acceptable. Storing everything as `Object` works, and throws away type checking:

```java
Object item = stack.pop();
String s = (String) item;      // crashes at run time if it was not a String
```

**Generics** let a class take a type as a parameter. You have used them already: `List<String>`, `Map<String, Integer>`.

## A generic class

```java
import java.util.ArrayList;
import java.util.List;

public class Box<T> {
    private final List<T> items = new ArrayList<>();

    public void add(T item) {
        items.add(item);
    }

    public T last() {
        return items.get(items.size() - 1);
    }

    public int size() {
        return items.size();
    }
}
```

`T` is a **type parameter**, a placeholder. It is filled in wherever the class is used:

```java
Box<String> names = new Box<>();
names.add("Ada");
String s = names.last();       // no cast needed

names.add(42);                 // compile error: 42 is not a String
```

The mistake is caught by the compiler, before the program runs.

By convention type parameters are single capital letters: `T` for a type, `E` for an element, `K` and `V` for key and value.

## A generic method

A method can have its own type parameter, written before the return type:

```java
public static <T> T firstOrDefault(List<T> items, T fallback) {
    return items.isEmpty() ? fallback : items.get(0);
}

String s = firstOrDefault(List.of("a", "b"), "none");
int n = firstOrDefault(new ArrayList<Integer>(), 0);
```

The compiler works out `T` from the arguments.

## Bounded types

Inside a generic method you may only do things that every possible `T` supports, and by default that is very little. To compare two values, they must be comparable. A **bound** states the requirement:

```java
public static <T extends Comparable<T>> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) {
        if (item.compareTo(best) > 0) {
            best = item;
        }
    }
    return best;
}
```

`<T extends Comparable<T>>` means: any type `T` that can be compared with other `T`s. `Integer`, `String` and `Double` all qualify. `a.compareTo(b)` returns a negative number, zero or a positive number when `a` is smaller than, equal to or larger than `b`.

## Making your own class comparable

```java
public class Version implements Comparable<Version> {
    private final int major;
    private final int minor;

    public Version(int major, int minor) {
        this.major = major;
        this.minor = minor;
    }

    @Override
    public int compareTo(Version other) {
        if (major != other.major) {
            return Integer.compare(major, other.major);
        }
        return Integer.compare(minor, other.minor);
    }
}
```

Now `Collections.sort`, `TreeMap` and the `max` method above all work with `Version`.

## Wildcards

`List<Integer>` is **not** a kind of `List<Number>`, even though `Integer` is a kind of `Number`. If it were, you could add a `Double` to a list of integers through the wider type.

When a method only reads from a list, a wildcard accepts the whole family:

```java
static double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue();
    }
    return total;
}

sum(List.of(1, 2, 3));        // List<Integer>
sum(List.of(1.5, 2.5));       // List<Double>
```

`? extends Number` means "some unknown type that is a `Number`". You can read `Number`s from such a list and cannot add to it.

## What generics cannot do

Generic type information is removed when the code is compiled. This is called **type erasure**. As a result:

- no primitives: `Box<int>` is not allowed. Use `Box<Integer>`;
- no `new T()` and no `new T[10]`;
- no `instanceof Box<String>`.

## Common mistakes

- **Raw types.** `List names = new ArrayList();` switches type checking off. Always give the type argument.
- **Forgetting the bound** and then finding that `compareTo` does not exist on `T`.
- **Expecting `List<Integer>` to be accepted where `List<Number>` is required.**
- **`<T>` in the wrong place** on a generic method. It goes before the return type.
