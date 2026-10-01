# Cache-aside

Write two functions in `solution.py`. They receive a `cache` and a `db` object. The tests pass fake ones that count how often they are called.

The cache has three methods, like the Redis client for Python:

- `cache.get(key)` returns a string, or `None` when the key is missing or expired
- `cache.setex(key, seconds, value)` stores a string with a time limit
- `cache.delete(key)` removes a key

The database has `db.load_user(user_id)`, which returns a dictionary or `None`, and `db.save_user(user_id, fields)`.

## `get_user(cache, db, user_id)`

- The cache key is `user:` followed by the id, for example `user:7`.
- On a hit, return the cached user, decoded from JSON. Do not touch the database.
- On a miss, load the user from the database, store it in the cache as JSON for **300** seconds, and return it.
- When the user does not exist, cache that too: store the text `null` for **30** seconds, and return `None`. The next request for that id must not reach the database.

## `update_user(cache, db, user_id, fields)`

Save to the database, then **delete** the user's key from the cache.
