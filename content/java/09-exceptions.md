---
title: Exceptions
summary: Signal that something went wrong, handle what you can, and never lose a resource.
---

## What an exception is

When a method cannot do its job, it **throws** an exception. Normal execution stops, and control passes up through the chain of callers until some code **catches** it. If nobody does, the program ends with a stack trace.

```text
Exception in thread "main" java.lang.ArithmeticException: / by zero
        at Main.average(Main.java:12)
        at Main.main(Main.java:5)
```

Read it from the top: the type, the message, then where it happened and who called that.

## try and catch

```java
try {
    int n = Integer.parseInt(text);
    System.out.println(n * 2);
} catch (NumberFormatException e) {
    System.out.println("not a number: " + text);
}
```

If the code in `try` throws a `NumberFormatException`, the rest of the block is skipped and the `catch` block runs. Other exception types pass through.

Handle several kinds, and add a `finally` block that runs however the `try` ends:

```java
try {
    process(file);
} catch (FileNotFoundException e) {
    System.err.println("missing: " + e.getMessage());
} catch (IOException e) {
    System.err.println("cannot read: " + e.getMessage());
} finally {
    System.out.println("done");
}
```

Put the more specific type first. `FileNotFoundException` is a kind of `IOException`.

## Throwing

```java
public void withdraw(long amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException("amount must be positive");
    }
    if (amount > balance) {
        throw new IllegalStateException("insufficient funds");
    }
    balance -= amount;
}
```

| Exception | Use it when |
| --- | --- |
| `IllegalArgumentException` | an argument is not acceptable |
| `IllegalStateException` | the object is in the wrong state for this call |
| `NullPointerException` | something was `null` that must not be |
| `IndexOutOfBoundsException` | an index is outside the valid range |
| `NoSuchElementException` | asked for an element that is not there |
| `UnsupportedOperationException` | the operation is not available |

## Checked and unchecked

Java has two families.

**Unchecked exceptions** extend `RuntimeException`. They usually indicate a bug: a bad argument, a null, an index out of range. You are not forced to catch them.

**Checked exceptions** extend `Exception` directly. They stand for failures that a correct program must still expect: a missing file, a dropped connection. The compiler **forces** you to deal with them. A method that can throw one must either catch it or declare it:

```java
public static String firstLine(Path path) throws IOException {
    return Files.readAllLines(path).get(0);
}
```

`throws IOException` passes the responsibility on to the caller.

## Your own exception types

A named type lets callers catch precisely this problem:

```java
public class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}
```

Extend `Exception` for a checked exception, or `RuntimeException` for an unchecked one.

```java
public static int parseAge(String text) throws InvalidAgeException {
    int age;
    try {
        age = Integer.parseInt(text.trim());
    } catch (NumberFormatException e) {
        throw new InvalidAgeException("not a number: " + text);
    }
    if (age < 0 || age > 150) {
        throw new InvalidAgeException("out of range: " + age);
    }
    return age;
}
```

Here a low-level exception is caught and translated into one that means something to the caller.

## try-with-resources

Files, network connections and database connections must be closed, even when an exception occurs. Declare them in the brackets after `try`, and Java closes them for you:

```java
try (BufferedReader reader = Files.newBufferedReader(path)) {
    return reader.readLine();
}
```

The reader is closed when the block ends, by any route. This works for every class that implements `AutoCloseable`. Always use it for resources.

## Handle it where you can do something about it

Catching an exception only to ignore it hides the failure:

```java
try {
    save(data);
} catch (IOException e) {
    // nothing here: the data is lost and nobody knows
}
```

If a method cannot recover, let the exception travel up to code that can retry, tell the user, or stop cleanly.

## Common mistakes

- **Empty catch blocks.**
- **`catch (Exception e)` around everything.** It also swallows the bugs you wanted to hear about.
- **Using exceptions for ordinary control flow**, such as ending a loop.
- **Losing the cause.** When wrapping an exception, pass the original along: `new MyException("...", e)`.
- **Closing resources by hand** in place of try-with-resources.
