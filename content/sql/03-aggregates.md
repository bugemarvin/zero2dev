---
title: Aggregates and GROUP BY
summary: Count, sum and average, for the whole table or for each group of rows.
---

## Aggregate functions

An aggregate function takes many rows and returns one value.

```sql
SELECT COUNT(*)   AS books,
       AVG(price) AS average_price,
       MIN(price) AS cheapest,
       MAX(price) AS dearest
FROM books;
```

| Function | Result |
| --- | --- |
| `COUNT(*)` | number of rows |
| `COUNT(column)` | number of rows where the column is **not NULL** |
| `COUNT(DISTINCT column)` | number of different values |
| `SUM(column)` | total |
| `AVG(column)` | average |
| `MIN(column)`, `MAX(column)` | smallest, largest |

Aggregates skip `NULL` values. `AVG(score)` averages only the rows that have a score.

## GROUP BY

`GROUP BY` splits the rows into groups, one for each different value, and computes the aggregates **per group**. The result has one row for each group.

```sql
SELECT genre,
       COUNT(*)   AS books,
       AVG(price) AS average_price
FROM books
GROUP BY genre;
```

| genre | books | average_price |
| --- | --- | --- |
| fiction | 5 | 13.4 |
| science | 3 | 24.0 |
| history | 2 | 18.5 |

The rule to remember: **every column in `SELECT` must either appear in `GROUP BY` or be inside an aggregate.** Each output row stands for a whole group, so a plain column like `title` has no single value to show. PostgreSQL refuses such a query. SQLite picks an arbitrary row, which is worse because it looks as if it worked.

You can group by several columns: `GROUP BY genre, year` makes one group for each combination.

## HAVING

`WHERE` filters rows **before** they are grouped. `HAVING` filters groups **after** the aggregates are computed.

```sql
SELECT genre, COUNT(*) AS books
FROM books
WHERE year >= 2000            -- only recent books go into the groups
GROUP BY genre
HAVING COUNT(*) >= 2          -- only genres with at least two such books
ORDER BY books DESC;
```

| Clause | Filters | Can use aggregates |
| --- | --- | --- |
| `WHERE` | individual rows | no |
| `HAVING` | groups | yes |

If a condition does not involve an aggregate, put it in `WHERE`. Fewer rows then need to be grouped.

## The full order

Written:

```sql
SELECT ...
FROM ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...
```

Evaluated: `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`.

## Rounding

Averages often come out with many decimals. Round in the query:

```sql
SELECT genre, ROUND(AVG(price), 2) AS average_price
FROM books
GROUP BY genre;
```

## Whole-number division

Dividing two integers gives an integer in SQL too. `7 / 2` is `3`. Multiply by `1.0` first when you want a fraction: `7 * 1.0 / 2`.

## Common mistakes

- **Selecting a column that is neither grouped nor aggregated.**
- **An aggregate in `WHERE`.** `WHERE COUNT(*) > 2` is an error. That is what `HAVING` is for.
- **`COUNT(column)` when you meant `COUNT(*)`.** The first skips NULLs.
- **Assuming the groups come out sorted.** Add `ORDER BY`.
