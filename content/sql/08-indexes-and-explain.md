---
title: Indexes and EXPLAIN
summary: Why a query is slow, how an index fixes it, and how to see what the database is really doing.
---

## The problem

```sql
SELECT * FROM orders WHERE customer_id = 42;
```

With no help, the database reads **every row** of `orders` and tests each one. That is a **sequential scan**: O(n). With a hundred rows nobody notices. With fifty million, the query takes seconds.

## What an index is

An index is a separate structure that keeps the values of a column in sorted order, each with a pointer to its row. It works like the index at the back of a book: look the word up, then go straight to the page.

PostgreSQL's default index is a **B-tree**, a wide, balanced [search tree](dsa/09-trees-and-bst). Finding a value in it takes O(log n) steps. For fifty million rows that is around four or five steps.

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

The query above now finds its rows directly.

A B-tree index serves equality (`=`), ranges (`<`, `>`, `BETWEEN`), sorting (`ORDER BY`) and prefix patterns (`LIKE 'abc%'`).

## Indexes you already have

A `PRIMARY KEY` or `UNIQUE` constraint creates an index automatically. That is how the database checks uniqueness quickly.

**Foreign key columns are not indexed automatically** in PostgreSQL. They are joined and filtered on all the time, so index them yourself.

A unique index doubles as a rule:

```sql
CREATE UNIQUE INDEX authors_name_idx ON authors (name);
```

## Indexes on several columns

```sql
CREATE INDEX books_genre_price_idx ON books (genre, price);
```

The entries are sorted by genre first, and by price within each genre, like a phone book sorted by surname and then first name.

| Query condition | Can it use the index? |
| --- | --- |
| `genre = 'fiction'` | yes |
| `genre = 'fiction' AND price < 15` | yes, fully |
| `price < 15` | no: price is not the leading column |

The order of the columns matters. Put the column you test with `=` first.

## EXPLAIN

`EXPLAIN` shows the plan the database has chosen, without running the query:

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
```

Before the index:

```text
Seq Scan on orders  (cost=0.00..1693.00 rows=10 width=24)
  Filter: (customer_id = 42)
```

After:

```text
Index Scan using orders_customer_id_idx on orders  (cost=0.29..8.47 rows=10 width=24)
  Index Cond: (customer_id = 42)
```

| Term | Meaning |
| --- | --- |
| `Seq Scan` | reads the whole table |
| `Index Scan` | uses an index to find the rows |
| `Index Only Scan` | answers from the index alone, never touching the table |
| `cost` | the planner's estimate, in its own units. Lower is better. |
| `rows` | how many rows the planner expects |

`EXPLAIN ANALYZE` **runs** the query and adds the real times and row counts. Use it to compare before and after. Be careful with `EXPLAIN ANALYZE` on an `UPDATE` or `DELETE`: it really performs the change.

## Why not index everything

- **Writes get slower.** Every `INSERT`, `UPDATE` and `DELETE` must update every index on the table.
- **They take disk space and memory.**
- **Small tables do not need them.** Scanning 200 rows is faster than using an index, and the planner knows it. On a tiny table you will see `Seq Scan` even when an index exists.
- **Unselective columns gain little.** An index on a column with two possible values rarely helps.

## What to index

1. Columns used in `WHERE` on large tables.
2. Foreign key columns used in joins.
3. Columns used in `ORDER BY` together with `LIMIT`.

Measure first. Find the slow query, read its plan, add one index, and read the plan again.

## What defeats an index

| Condition | Problem |
| --- | --- |
| `WHERE LOWER(email) = 'a@b.c'` | a function is applied to the column |
| `WHERE price * 2 > 30` | arithmetic on the column. Write `price > 15`. |
| `WHERE name LIKE '%son'` | the pattern starts with a wildcard |

For the first, PostgreSQL can index the expression itself: `CREATE INDEX ON members (LOWER(email));`

## Common mistakes

- **Indexing before measuring.**
- **Wrong column order** in a multi-column index.
- **Forgetting foreign keys.**
- **Wrapping the indexed column in a function** in the `WHERE` clause.
- **Never removing unused indexes.** They slow down every write.
