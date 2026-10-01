---
title: Sorting, limiting and computed columns
summary: Put rows in order, take the first few, remove duplicates, and calculate new columns.
---

## Rows have no order

A table is a set of rows. Without `ORDER BY`, the database may return them in any order, and that order can change from one run to the next. If the order matters to you, say so.

## ORDER BY

```sql
SELECT title, price
FROM books
ORDER BY price;
```

The default is ascending: smallest first. Add `DESC` for the opposite.

```sql
ORDER BY price DESC
```

Sort by several columns. The second is used only where the first is equal:

```sql
SELECT title, genre, price
FROM books
ORDER BY genre, price DESC;
```

That lists the genres alphabetically, and within each genre the most expensive book first.

A complete ordering needs a **tie-breaker**. If two books cost the same, `ORDER BY price` leaves their relative order undefined. `ORDER BY price DESC, title` settles it.

## LIMIT

```sql
SELECT title, price
FROM books
ORDER BY price DESC
LIMIT 3;
```

The three most expensive books. `LIMIT` is applied after sorting, so `ORDER BY` decides **which** rows you get. `LIMIT` without `ORDER BY` returns some arbitrary rows.

`OFFSET` skips rows first, which is how paging works:

```sql
LIMIT 10 OFFSET 20      -- rows 21 to 30
```

## DISTINCT

`DISTINCT` removes duplicate rows from the result:

```sql
SELECT DISTINCT genre
FROM books;
```

With several columns it applies to the combination.

## Computed columns and aliases

A column in the result can be an expression. `AS` gives it a name:

```sql
SELECT title,
       price,
       price * 1.2 AS price_with_tax
FROM books;
```

| Function | Result |
| --- | --- |
| `ROUND(x, 2)` | `x` rounded to 2 decimals |
| `UPPER(s)`, `LOWER(s)` | text in upper or lower case |
| `LENGTH(s)` | number of characters |
| `a \|\| b` | the two texts joined together |
| `COALESCE(x, y)` | `x`, or `y` if `x` is NULL |

```sql
SELECT name, COALESCE(city, 'unknown') AS city
FROM customers;
```

## CASE

`CASE` is SQL's if/else. It produces a value:

```sql
SELECT title,
       CASE
           WHEN price < 12 THEN 'cheap'
           WHEN price < 20 THEN 'medium'
           ELSE 'expensive'
       END AS band
FROM books;
```

The conditions are tried from the top, and the first one that holds wins.

## The order of the clauses

The clauses must be **written** in this order:

```sql
SELECT ...
FROM ...
WHERE ...
ORDER BY ...
LIMIT ...
```

The database **evaluates** them in a different order: `FROM`, then `WHERE`, then `SELECT`, then `ORDER BY`, then `LIMIT`. One consequence: an alias created in `SELECT` does not exist yet when `WHERE` runs, so you cannot use it there. You can use it in `ORDER BY`.

```sql
SELECT title, price * 1.2 AS gross
FROM books
WHERE price * 1.2 > 20        -- the alias gross is not available here
ORDER BY gross;               -- and here it is
```

## Common mistakes

- **Relying on order with no `ORDER BY`.**
- **`LIMIT` with no `ORDER BY`**, when you meant "the top few".
- **No tie-breaker**, so equal rows come out in a different order on different runs.
- **Using a `SELECT` alias inside `WHERE`.**
- **Where NULLs sort.** PostgreSQL puts them last in ascending order, SQLite puts them first. Say `NULLS FIRST` or `NULLS LAST` when it matters.
