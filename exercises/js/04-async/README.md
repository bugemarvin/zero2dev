# Promises in practice

Write four exported functions in `solution.mjs`.

- `delay(ms, value)` returns a promise that is fulfilled with `value` after `ms` milliseconds.
- `fetchAll(ids, fetchOne)` calls the async function `fetchOne(id)` for every id **at the same time** and returns a promise of the results, in the same order as the ids.
- `retry(fn, times)` calls the async function `fn()`. If it rejects, it tries again, up to `times` attempts in total. It returns the first successful result. If every attempt fails, it rejects with the last error.
- `withTimeout(promise, ms)` returns a promise that settles like `promise`, but rejects with an `Error` whose message is `timeout` if `ms` milliseconds pass first.
