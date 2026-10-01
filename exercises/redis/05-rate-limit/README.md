# A rate limiter

Write two functions in `solution.py`. They receive a `redis` object with the methods `incr(key)`, `expire(key, seconds)` and `get(key)`. The tests pass a fake one whose clock they control.

## `allow(redis, client, limit, window)`

Returns `True` when the client may make a request, `False` when it has used up its allowance.

- The key is `rate:` followed by the client, for example `rate:10.0.0.1`.
- Each call adds 1 to the counter with `incr`.
- On the **first** request of a window, set the key to expire after `window` seconds. Do not reset the expiry on later requests.
- The request is allowed when the count is at most `limit`.

## `remaining(redis, client, limit)`

Returns how many requests the client has left in the current window, never less than 0. A client with no counter has `limit` left. `redis.get` returns a string or `None`.
