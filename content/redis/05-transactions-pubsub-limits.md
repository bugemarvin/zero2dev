---
title: Transactions, rate limits and messaging
summary: Several commands as one, limiting how often something may happen, and sending messages between programs.
---

## Several commands as one

Redis runs one command at a time, so each command is atomic. Two commands in a row are not: another client can run between them.

`MULTI` and `EXEC` group commands so that **nothing else runs in between**:

```text
MULTI
DECRBY account:1 50
INCRBY account:2 50
EXEC
```

The commands are queued, and `EXEC` runs them all. `DISCARD` drops the queue.

This is not a transaction in the SQL sense. If one command fails while running, for example an `INCR` on a text value, the others still take effect. There is no rollback.

## Check, then act

To act only if a value has not changed since you read it, `WATCH` the key first:

```text
WATCH stock:mug
GET stock:mug          # the program sees 3 and decides to sell one
MULTI
DECR stock:mug
EXEC                   # replies (nil) if another client changed stock:mug meanwhile
```

When `EXEC` returns nil, the program reads again and retries. This is **optimistic locking**: nobody waits, and a conflict costs a retry.

For more complex atomic logic, Redis runs **Lua scripts** on the server with `EVAL`. The whole script runs as one command.

## Rate limiting

"At most 5 login attempts per minute for each address." A counter with an expiry does it:

```python
def allow(redis, client, limit=5, window=60):
    key = f"rate:{client}"
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, window)      # the window starts with the first request
    return count <= limit
```

- The first request creates the counter and starts the clock.
- Every request adds one.
- When the key expires, the client starts fresh.

This is a **fixed window**. It is simple, and it allows a burst at the edge of two windows: 5 requests at the end of one minute and 5 more at the start of the next. A **sliding window** is more exact: store one entry per request in a sorted set with the time as its score, remove entries older than the window, and count the rest.

One subtlety: if the program stops between `INCR` and `EXPIRE`, the key never expires and the client is locked out for ever. Send both in one `MULTI`, or use a Lua script.

## Publish and subscribe

A program **subscribes** to a channel, and every message **published** to it is delivered at once to all subscribers:

```text
SUBSCRIBE news                    # terminal 1: waits for messages
PUBLISH news "we are live"        # terminal 2: replies with the number of receivers
```

Pub/sub is "fire and forget". A message published while nobody is listening is gone. Use it for live notifications, such as pushing chat messages to connected browsers, and never for work that must not be lost.

## Streams

A **stream** is a log of messages that **stays**. Readers keep their own position, and a **consumer group** shares the messages among several workers and tracks which were finished:

```text
XADD orders * customer ada total 42            # * lets Redis choose the id
XRANGE orders - +                              # read everything
XGROUP CREATE orders billing 0
XREADGROUP GROUP billing worker-1 COUNT 10 STREAMS orders >
XACK orders billing 1717000000000-0            # this message is done
```

A worker that crashes before `XACK` leaves its messages pending, and another worker can claim them. That is what a reliable queue needs.

| You need | Use |
| --- | --- |
| a simple job queue, one consumer | a list with `BLPOP` |
| live notifications that may be missed | pub/sub |
| a durable log, several workers, acknowledgements | a stream |

## Persistence

Redis can write its memory to disk in two ways:

- **RDB**: a snapshot every so often. Compact, and you may lose the minutes since the last one.
- **AOF**: a log of every write. Loses at most about a second.

A pure cache can run with neither. Data you cannot rebuild needs AOF, and backups.

## Common mistakes

- **Expecting `MULTI` to roll back** when a command fails.
- **A rate limit whose key never expires.**
- **Pub/sub for jobs** that must be done.
- **Long Lua scripts.** While one runs, nothing else does.
- **No password on a Redis server reachable from the network.** Bind it to localhost or set `requirepass`. Open Redis servers are found and abused within hours.
