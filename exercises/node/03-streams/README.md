# Events and a stream of lines

Write the following in `solution.mjs`.

## `Stock`

A class that extends `EventEmitter` and tracks the quantity of products.

- `add(name, quantity)` adds to the quantity of a product (it starts at 0) and emits `"changed"` with `{ name, quantity }`, where `quantity` is the new total.
- `remove(name, quantity)` subtracts. When that would go below 0, nothing changes and it emits `"error"` with an `Error` whose message is `not enough NAME`. Otherwise it emits `"changed"`, and when the new total is exactly 0 it **also** emits `"empty"` with the name, after `"changed"`.
- `quantity(name)` returns the current quantity, 0 for an unknown product.

## `splitLines(source)`

An `async function*` that receives an async iterable of text chunks and yields complete lines, without the newline. A chunk can end in the middle of a line. A last line without a newline is yielded too. Empty lines in the middle are yielded as empty strings.

## `summarize(source)`

An `async` function that receives chunks of an access log with lines such as `GET /home 200 12` (method, path, status, milliseconds) and returns:

```javascript
{ requests: 3, errors: 1, slowest: "/report" }
```

`errors` counts the lines whose status is 500 or more. `slowest` is the path of the line with the most milliseconds, or `null` when there are no lines. Blank lines are ignored. Use `splitLines`.
