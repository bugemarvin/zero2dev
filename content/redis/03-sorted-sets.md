---
title: Sorted sets
summary: Rankings, leaderboards and time-ordered data, always kept in order.
---

## A set with scores

A **sorted set** holds unique members, each with a number called its **score**. Redis keeps the members ordered by score at all times.

```text
ZADD leaderboard 1500 ada
ZADD leaderboard 900 sam 2100 kim
```

Adding a member that exists **updates its score**.

## Reading by rank

```text
ZRANGE leaderboard 0 -1                     # lowest score first: sam, ada, kim
ZREVRANGE leaderboard 0 2                   # highest first, positions 0 to 2: the top three
ZREVRANGE leaderboard 0 2 WITHSCORES        # with the scores
```

Positions start at 0, and `-1` is the last one.

## One member

```text
ZSCORE leaderboard ada              -> "1500"
ZREVRANK leaderboard ada            -> 1: second place, counting from 0
ZRANK leaderboard ada               -> 1: position from the lowest
ZINCRBY leaderboard 700 ada         -> "2200": add to the score
ZREM leaderboard sam
ZCARD leaderboard                   -> how many members
```

`ZINCRBY` is atomic, like `INCR`. A game server calls it after every match and the board is always right.

## Reading by score

```text
ZRANGEBYSCORE leaderboard 1000 2000         # scores from 1000 to 2000
ZRANGEBYSCORE leaderboard (1000 +inf        # more than 1000: ( excludes the value
ZCOUNT leaderboard 1000 2000                # how many
ZREMRANGEBYSCORE leaderboard -inf 500       # delete the low scores
```

## Why not sort in the application?

Sorting a million players on every page view is slow. A sorted set finds the top ten, or one player's rank, in a time that barely grows with the number of members. Each operation costs about the logarithm of the size: a million members take around twenty steps.

## Time as the score

Use a timestamp as the score, and the sorted set becomes a timeline:

```text
ZADD events 1717000000 "user 42 logged in"
ZADD events 1717000060 "user 42 bought a mug"

ZRANGEBYSCORE events 1717000000 1717003600      # everything in that hour
ZREMRANGEBYSCORE events -inf 1716913600         # drop what is older than a day
```

The same idea gives:

- a **delayed queue**: the score is the time a job should run, and a worker takes those with a score up to now;
- a **sliding-window rate limit**: one entry per request, count the entries in the last minute;
- **"recently active" lists**.

## Ties

Members with equal scores are ordered alphabetically. If you need "who got there first" as a tie-breaker, build it into the score.

## Common mistakes

- **Storing a list and sorting it yourself.**
- **Forgetting `REV`** and showing the lowest scores as the "top".
- **Thinking ranks start at 1.** They start at 0.
- **A sorted set that grows for ever.** Trim it with `ZREMRANGEBYRANK` or `ZREMRANGEBYSCORE`.
