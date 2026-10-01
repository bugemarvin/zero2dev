---
title: Window functions and JSON
summary: Rank and compare rows without collapsing them, and query flexible JSON data in PostgreSQL.
---

## What GROUP BY cannot do

`GROUP BY` reduces each group to a single row. Sometimes you want to keep **every row** and add something computed from its group: its rank, a running total, the difference from the group's average.

A **window function** does that. It looks at a set of rows related to the current one, the **window**, and returns a value for each row.

## OVER

```sql
SELECT title,
       genre,
       price,
       AVG(price) OVER (PARTITION BY genre) AS genre_average
FROM books;
```

| title | genre | price | genre_average |
| --- | --- | --- | --- |
| Paper Boats | fiction | 9.50 | 13.40 |
| The Silent River | fiction | 12.50 | 13.40 |
| Counting Stars | science | 22.00 | 24.00 |

Every book is still there, each with the average of its own genre beside it.

- `OVER (...)` turns an aggregate into a window function.
- `PARTITION BY genre` splits the rows into windows, as `GROUP BY` would, without merging them.
- `OVER ()` with nothing inside means one window: all rows.

## Ranking

`ORDER BY` inside `OVER` puts the rows of each window in order, which ranking needs:

```sql
SELECT title,
       genre,
       price,
       RANK() OVER (PARTITION BY genre ORDER BY price DESC) AS position
FROM books
ORDER BY genre, position;
```

| Function | With prices 20, 20, 15 |
| --- | --- |
| `ROW_NUMBER()` | 1, 2, 3: always different, ties broken arbitrarily |
| `RANK()` | 1, 1, 3: ties share a rank, then a gap |
| `DENSE_RANK()` | 1, 1, 2: ties share a rank, no gap |

## The top N of each group

A window function cannot be used in `WHERE`, because it is computed after `WHERE` has run. Compute it in a [CTE](sql/05-subqueries-and-ctes), then filter:

```sql
WITH ranked AS (
    SELECT title, genre, price,
           ROW_NUMBER() OVER (PARTITION BY genre ORDER BY price DESC) AS n
    FROM books
)
SELECT title, genre, price
FROM ranked
WHERE n <= 2;
```

The two most expensive books of every genre.

## Running totals and neighbours

With `ORDER BY` in the window, an aggregate accumulates from the first row up to the current one:

```sql
SELECT ordered_on,
       quantity,
       SUM(quantity) OVER (ORDER BY ordered_on, id) AS running_total
FROM orders;
```

`LAG` and `LEAD` read the previous or next row:

```sql
SELECT ordered_on,
       quantity,
       quantity - LAG(quantity) OVER (ORDER BY ordered_on, id) AS change
FROM orders;
```

The first row has no previous row, so `LAG` gives `NULL` there.

## JSON in PostgreSQL

Some data does not fit fixed columns: settings, events with varying fields, responses from other systems. PostgreSQL has a `JSONB` type that stores JSON in a searchable binary form.

```sql
CREATE TABLE events (
    id       SERIAL PRIMARY KEY,
    payload  JSONB NOT NULL
);

INSERT INTO events (payload) VALUES
    ('{"type": "login", "user": "ada", "device": {"os": "linux"}}'),
    ('{"type": "purchase", "user": "ada", "total": 42.5}');
```

## Reading JSON

| Operator | Returns | Example |
| --- | --- | --- |
| `->` | a JSON value | `payload -> 'device'` |
| `->>` | **text** | `payload ->> 'user'` |
| `#>>` | text at a path | `payload #>> '{device,os}'` |
| `@>` | true if the left side contains the right | `payload @> '{"type": "login"}'` |
| `?` | true if the key exists | `payload ? 'total'` |

```sql
SELECT payload ->> 'user' AS user_name,
       payload -> 'device' ->> 'os' AS os
FROM events
WHERE payload @> '{"type": "login"}';
```

`->>` always gives text. Convert it when you need a number:

```sql
SELECT SUM((payload ->> 'total')::NUMERIC)
FROM events
WHERE payload ->> 'type' = 'purchase';
```

`::NUMERIC` is PostgreSQL's short form of a cast.

JSON values work with everything else in SQL, including grouping:

```sql
SELECT payload ->> 'user' AS user_name, COUNT(*) AS logins
FROM events
WHERE payload @> '{"type": "login"}'
GROUP BY payload ->> 'user'
ORDER BY logins DESC, user_name;
```

## Indexing JSON

A **GIN index** makes containment searches fast on large tables:

```sql
CREATE INDEX events_payload_idx ON events USING GIN (payload);
```

## Columns or JSON?

| Use ordinary columns when | Use JSONB when |
| --- | --- |
| every row has the field | the fields vary from row to row |
| you filter, join or sort on it often | you mostly store it and read it back |
| you want constraints and types | the shape is decided by another system |

JSON gives up the guarantees of a schema: nothing stops `"total"` from being text in one row and missing in the next. A good default is real columns for what you know, and one `JSONB` column for the rest.

## Where to go next

You can now read and write the SQL that covers most application work: queries, joins, aggregates, schema design, indexes, transactions and window functions.

To go deeper with PostgreSQL, explore `psql` (`\d` lists tables, `\d books` describes one, `\timing` shows how long queries take), read `EXPLAIN ANALYZE` plans for your own queries, and look at views, triggers and full-text search.

## Common mistakes

- **A window function in `WHERE`.** Use a CTE or subquery.
- **Expecting `PARTITION BY` to reduce the number of rows.** It does not.
- **`->` where `->>` was needed**, which compares JSON with text and matches nothing.
- **Putting everything in one JSON column.**
