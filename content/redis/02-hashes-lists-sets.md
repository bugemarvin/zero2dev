---
title: Hashes, lists and sets
summary: Three data structures, and the problems each one solves.
---

## Hashes: an object

A **hash** stores fields and values under one key. It is the natural shape for an object:

```text
HSET user:42 name "Sam" email "sam@example.com" visits 0
HGET user:42 name                 -> "Sam"
HGETALL user:42                   -> every field and value
HINCRBY user:42 visits 1          -> 1
HDEL user:42 email
HEXISTS user:42 email             -> 0
```

Compared with storing the whole object as one JSON string, a hash lets you read and change **one field** without fetching and rewriting everything.

## Lists: a queue

A **list** is a sequence with two ends. Pushing and popping at either end is instant.

```text
RPUSH jobs "email:1" "email:2"    # add on the right
LPUSH jobs "urgent"               # add on the left
LRANGE jobs 0 -1                  -> "urgent", "email:1", "email:2"
LLEN jobs                         -> 3
LPOP jobs                         -> "urgent"
RPOP jobs                         -> "email:2"
```

`LRANGE key 0 -1` reads the whole list. Negative positions count from the end.

| Pattern | Commands |
| --- | --- |
| a **queue** (first in, first out) | `RPUSH` to add, `LPOP` to take |
| a **stack** (last in, first out) | `LPUSH` and `LPOP` |
| the **latest 10** of something | `LPUSH` then `LTRIM key 0 9` |

A worker that should wait for a job uses the blocking form:

```text
BLPOP jobs 5          # wait up to 5 seconds for an element
```

That is a job queue between two programs with no polling.

## Sets: unique members

A **set** holds each value at most once, in no order.

```text
SADD tags:post:1 redis database cache
SADD tags:post:1 redis            -> 0: it was already there
SMEMBERS tags:post:1
SISMEMBER tags:post:1 cache       -> 1
SCARD tags:post:1                 -> 3: how many
SREM tags:post:1 cache
```

Sets can be combined on the server:

```text
SADD online:today  ada sam kim
SADD online:yesterday  sam lee

SINTER online:today online:yesterday     -> sam: in both
SUNION online:today online:yesterday     -> everyone
SDIFF online:today online:yesterday      -> ada, kim: today but not yesterday
```

Typical uses: "who liked this", "unique visitors today", "which of my friends also follow X".

## Which structure?

| You need | Use |
| --- | --- |
| one value, a counter, a cached page | string |
| an object with fields | hash |
| things in order, a queue | list |
| unique things, membership tests | set |
| a ranking by score | sorted set (next lesson) |

## One type per key

A key holds one type. Using a list command on a string fails:

```text
SET name "Sam"
LPUSH name "x"        -> WRONGTYPE Operation against a key holding the wrong kind of value
```

`TYPE key` tells you what a key holds. Empty lists, sets and hashes are removed automatically.

## Common mistakes

- **One giant JSON string** where a hash would allow changing one field.
- **A list that only ever grows.** Trim it with `LTRIM`, or give the key an expiry.
- **A list where uniqueness matters.** That is a set.
- **Polling a queue in a loop** in place of `BLPOP`.
- **`SMEMBERS` on a set with millions of members.** Use `SSCAN`.
