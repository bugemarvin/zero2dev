# A stack class and a counter closure

Write three exports in `solution.mjs`.

## `EmptyStackError`

A class that extends `Error`. Its `name` is `"EmptyStackError"` and its message is `the stack is empty`.

## `Stack`

- `push(item)` puts an item on top.
- `pop()` removes and returns the top item. On an empty stack it throws an `EmptyStackError`.
- `peek()` returns the top item without removing it, and throws `EmptyStackError` when empty.
- `size` is a **getter**: `stack.size`, with no brackets.
- `isEmpty()` returns `true` or `false`.
- The items are stored in a private field, so `stack.items` is `undefined`.

## `counter(start)`

A function that returns an object with three functions: `increment()`, `reset()` and `value()`. Each call to `counter` has its own count, which starts at `start`, or at 0 when no argument is given. `reset()` goes back to the starting value. The count itself is not reachable from outside.
