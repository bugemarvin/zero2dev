---
title: Caching
summary: Make slow things fast, and the two hard parts: keeping the cache fresh and surviving a miss.
---

## The idea

A database query takes 80 milliseconds. Its result changes once an hour and is asked for a thousand times a minute. Keep the result in Redis, and all but one of those requests take under a millisecond.

A **cache** is a fast copy of data whose real home is somewhere slower.

## Cache-aside

The most common pattern. The application looks in the cache first and falls back to the source:

```python
import json

def get_product(cache, db, product_id):
    key = f"product:{product_id}"

    cached = cache.get(key)
    if cached is not None:                       # hit
        return json.loads(cached)

    product = db.load_product(product_id)        # miss: go to the source
    if product is not None:
        cache.setex(key, 300, json.dumps(product))    # keep it for 300 seconds
    return product
```

- A **hit**: the value is in the cache.
- A **miss**: it is not, so the source is asked and the answer is stored for next time.
- `setex(key, seconds, value)` stores with a time limit. In `redis-cli` that is `SET key value EX 300`.

Values in Redis are strings, so objects are stored as JSON.

With the `redis` package for Python, `cache` is created like this:

```python
import redis

cache = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True)
```

## Time to live

Every cached value needs an expiry. The TTL is your answer to "how stale may this be?":

| Data | A sensible TTL |
| --- | --- |
| a stock price | seconds |
| a product page | minutes |
| a list of countries | a day |

A cache with no expiry fills memory, and serves data that was true last year.

## Invalidation

When the data changes, the cached copy is wrong. The simple, robust fix: **delete the key when you write.**

```python
def update_product(cache, db, product_id, fields):
    db.save_product(product_id, fields)
    cache.delete(f"product:{product_id}")       # the next read is a miss and reloads
```

Delete, do not update. Rewriting the cached value from the writer invites races between two writers. Deleting is always safe, and the TTL is the safety net for anything you forget.

There is a well-known joke that there are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors. The first one is not a joke.

## Caching "not found"

If a product does not exist, every request for it is a miss and goes to the database. An attacker asking for a million made-up ids can bring the database down. This is **cache penetration**.

Cache the absence too, with a short TTL:

```python
if product is None:
    cache.setex(key, 30, "null")
```

## The stampede

A popular key expires. In the same instant, five hundred requests miss and all run the slow query together. This is a **cache stampede**.

Ways to soften it:

- add a little **randomness** to each TTL, so keys do not all expire at once;
- let only one request rebuild, using a short lock: `SET lock:product:17 1 NX EX 10`, while the others wait briefly or serve the old value;
- refresh popular keys **before** they expire.

## What to cache

Good candidates are read often, change rarely, and are expensive to produce. Bad candidates change on every request, are different for every user and request, or must never be stale, such as an account balance during a payment.

Measure first. A cache adds a moving part and a new class of bugs: "it works for me but the user sees old data".

## When memory is full

Configure Redis as a cache with a memory limit and an **eviction policy**. `allkeys-lru` removes the keys that were used least recently to make room.

## Common mistakes

- **No TTL.**
- **Updating the database and forgetting the cache.**
- **Caching per-user data under a shared key**, and showing one user another's data. Put everything that changes the answer into the key.
- **Not caching misses.**
- **Treating the cache as the source of truth.** It can be emptied at any moment, and the application must still work.
