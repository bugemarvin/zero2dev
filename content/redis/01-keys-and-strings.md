---
title: Keys, strings and expiry
summary: What Redis is, the basic commands, and keys that delete themselves.
---

## What Redis is

Redis is a database that keeps its data **in memory**. Reading and writing take well under a millisecond. It stores **values under keys**, and the values are data structures: strings, lists, hashes, sets and sorted sets.

That speed makes it the standard tool for:

- **caching** the results of slow queries and API calls;
- **sessions** and other short-lived data;
- **counters** and **rate limits**;
- **queues** between services;
- **leaderboards** and other rankings.

It usually sits **next to** a main database such as PostgreSQL, not in place of it.

## Trying it

The app starts Redis for you: on the Setup page, or with `python3 check.py services up redis`. Then talk to it with `redis-cli`:

```console
$ redis-cli -p 63790
127.0.0.1:63790> PING
PONG
```

If Redis is already installed on your machine, it runs on port 6379 and plain `redis-cli` connects to it. Without installing anything: `docker exec -it z2d-redis redis-cli`.

Commands are not case-sensitive. Keys and values are.

## Strings

```text
SET greeting "hello"
GET greeting              -> "hello"
GET nothing               -> (nil)
EXISTS greeting           -> 1
DEL greeting              -> 1   (the number of keys deleted)
```

A "string" is any sequence of bytes up to 512 MB: text, a number, JSON, an image.

Several at once:

```text
MSET a 1 b 2
MGET a b nothing          -> "1", "2", (nil)
```

## Counters

```text
SET visits 10
INCR visits               -> 11
INCRBY visits 5           -> 16
DECR visits               -> 15
```

`INCR` on a key that does not exist starts from 0.

Redis runs commands **one at a time**. An `INCR` is never interrupted, so a thousand clients incrementing the same counter always get a thousand different numbers. You do not need locks.

## Expiry

A key can delete itself after a time. This is what makes Redis a cache:

```text
SET session:abc "user 42" EX 3600     # expires in 3600 seconds
TTL session:abc                       -> 3597: seconds left
EXPIRE greeting 60                    # put a time limit on an existing key
PERSIST greeting                      # remove the limit
```

| `TTL` answer | Meaning |
| --- | --- |
| a positive number | seconds left |
| `-1` | the key exists and never expires |
| `-2` | the key does not exist |

A plain `SET` on a key **removes** its expiry. Write `SET key value KEEPTTL` to keep it.

## Only if it does not exist

```text
SET lock:report "worker-1" NX EX 30
```

`NX` sets the key only when it is absent. The reply is `OK` if you got it and `(nil)` if someone else did. With an expiry it is a simple **lock** that frees itself if its holder crashes.

## Naming keys

Redis has one flat space of keys. The convention is to build names with colons:

```text
user:42:name
session:abc123
cache:product:17
```

Good names say what kind of thing it is and which one.

## Finding keys

```text
SCAN 0 MATCH user:* COUNT 100
```

`SCAN` walks through the keys in steps. **Never use `KEYS *` on a production server**: it looks at every key in one go, and since Redis does one thing at a time, everything else waits.

## Common mistakes

- **Treating Redis as the only copy of important data.** Memory is lost on a crash unless persistence is configured, and a cache may evict keys when memory is full.
- **Keys with no expiry** in a cache, which grow until memory runs out.
- **`KEYS *` in production.**
- **Overwriting a key with `SET` and losing its expiry.**
- **Storing a number, reading it, adding one and writing it back.** Use `INCR`.
