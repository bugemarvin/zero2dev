# A generic stack

Complete two generic pieces of code.

## `ArrayStack<T>` in `ArrayStack.java`

A stack that can hold any one type.

- `void push(T item)`
- `T pop()`: removes and returns the top item. Throws `java.util.NoSuchElementException` if the stack is empty.
- `T peek()`: returns the top item without removing it. Throws `NoSuchElementException` if empty.
- `boolean isEmpty()`
- `int size()`

## `Util.max` in `Util.java`

`static <T extends Comparable<T>> T max(List<T> items)` returns the largest item, using `compareTo`. It throws `IllegalArgumentException` for an empty list.

```java
ArrayStack<String> s = new ArrayStack<>();
s.push("a");
s.push("b");
s.pop();                               // "b"
Util.max(List.of(3, 9, 4));            // 9
Util.max(List.of("pear", "apple"));    // "pear"
```
