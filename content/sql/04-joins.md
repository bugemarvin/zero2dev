---
title: Joins
summary: Combine rows from several tables. The feature that makes a relational database relational.
---

## Why data is split across tables

The bookshop does not store the author's name in every book row. It stores the author **once**, in an `authors` table, and each book holds the author's `id`.

| books.title | books.author_id | | authors.id | authors.name |
| --- | --- | --- | --- | --- |
| The Silent River | 1 | | 1 | Mara Lind |
| Night Trains | 1 | | 2 | Tom Okafor |
| Counting Stars | 2 | | | |

- `authors.id` is a **primary key**: a value that identifies exactly one row.
- `books.author_id` is a **foreign key**: it refers to the primary key of another table.

If Mara Lind changes her name, one row changes. Nothing can become inconsistent.

## INNER JOIN

A join puts rows from two tables side by side wherever a condition holds.

```sql
SELECT books.title, authors.name
FROM books
JOIN authors ON authors.id = books.author_id;
```

For each book, the database finds the author row whose `id` equals the book's `author_id`, and produces one combined row.

`JOIN` alone means `INNER JOIN`: only rows that have a match on **both** sides appear.

## Table aliases

Short names keep queries readable:

```sql
SELECT b.title, a.name
FROM books AS b
JOIN authors AS a ON a.id = b.author_id
WHERE b.year > 2000
ORDER BY b.title;
```

When a column name exists in both tables, such as `id`, you must say which one you mean: `b.id` or `a.id`. Prefixing every column is a good habit.

## LEFT JOIN

An inner join drops rows that have no partner. An author with no books would vanish from the result.

`LEFT JOIN` keeps **every row of the left table**. Where there is no match, the columns from the right table are `NULL`.

```sql
SELECT a.name, b.title
FROM authors AS a
LEFT JOIN books AS b ON b.author_id = a.id;
```

| name | title |
| --- | --- |
| Mara Lind | The Silent River |
| Mara Lind | Night Trains |
| Tom Okafor | Counting Stars |
| Eva Brandt | NULL |

## Counting with a left join

To count the books of each author, including authors with none:

```sql
SELECT a.name, COUNT(b.id) AS books
FROM authors AS a
LEFT JOIN books AS b ON b.author_id = a.id
GROUP BY a.id, a.name
ORDER BY a.name;
```

`COUNT(b.id)` is essential. `COUNT(*)` counts rows, and the author with no books still has one row, the one filled with NULLs, so it would report 1. `COUNT(b.id)` skips NULLs and reports 0.

## Finding rows with no match

A left join followed by a NULL test finds what is missing:

```sql
SELECT a.name
FROM authors AS a
LEFT JOIN books AS b ON b.author_id = a.id
WHERE b.id IS NULL;
```

## Joining more than two tables

Add one `JOIN` for each further table:

```sql
SELECT c.name, b.title, o.quantity
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
JOIN books AS b ON b.id = o.book_id;
```

## The kinds of join

| Join | Keeps |
| --- | --- |
| `INNER JOIN` | only rows that match on both sides |
| `LEFT JOIN` | all rows of the left table |
| `RIGHT JOIN` | all rows of the right table |
| `FULL JOIN` | all rows of both |
| `CROSS JOIN` | every combination of rows |

Inner and left joins cover nearly all everyday work.

## Rows multiply

A join produces one row for **every matching pair**. If an author has three books, the author's data appears three times. Joining two "many" sides, say orders and reviews of the same book, multiplies them: 4 orders and 3 reviews give 12 rows, and any `SUM` over that is inflated. When totals look too large, check how many rows the join really produces.

## Common mistakes

- **Leaving out the `ON` condition.** Every row is paired with every other row.
- **A `WHERE` condition on the right table of a left join.** `WHERE b.year > 2000` removes the NULL rows and turns the join back into an inner join. Put the condition in the `ON` clause to keep unmatched rows.
- **`COUNT(*)` with a left join**, which counts unmatched rows as 1.
- **Ambiguous column names.** Prefix them.
