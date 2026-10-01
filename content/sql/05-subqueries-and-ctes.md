---
title: Subqueries and CTEs
summary: Use the result of one query inside another, and name the steps of a long query.
---

## A query inside a query

A **subquery** is a `SELECT` in brackets, used inside another statement.

### A single value

A subquery that returns one row and one column can stand wherever a value can:

```sql
SELECT title, price
FROM books
WHERE price > (SELECT AVG(price) FROM books);
```

The inner query runs first and yields one number. The outer query compares each book against it.

### A list of values

With `IN`, a subquery supplies the list:

```sql
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders);
```

Customers who have placed at least one order.

### EXISTS

`EXISTS` is true when the subquery returns at least one row. The subquery normally refers to the current row of the outer query, which makes it a **correlated** subquery:

```sql
SELECT c.name
FROM customers AS c
WHERE EXISTS (
    SELECT 1
    FROM orders AS o
    WHERE o.customer_id = c.id
);
```

`NOT EXISTS` finds rows with **no** match:

```sql
SELECT c.name
FROM customers AS c
WHERE NOT EXISTS (
    SELECT 1 FROM orders AS o WHERE o.customer_id = c.id
);
```

### The trap in NOT IN

`NOT IN` behaves badly when the list contains a `NULL`: the whole condition becomes unknown, and the query returns **no rows**. `NOT EXISTS` has no such problem. Prefer it for "has no matching row" questions.

## Subqueries in FROM

A subquery can act as a temporary table. It needs an alias.

```sql
SELECT genre, average_price
FROM (
    SELECT genre, AVG(price) AS average_price
    FROM books
    GROUP BY genre
) AS per_genre
WHERE average_price > 15;
```

## Common table expressions

Nested subqueries become hard to read. A **CTE**, written with `WITH`, gives a subquery a name and puts it first, so the query reads from top to bottom:

```sql
WITH per_genre AS (
    SELECT genre, AVG(price) AS average_price
    FROM books
    GROUP BY genre
)
SELECT genre, average_price
FROM per_genre
WHERE average_price > 15;
```

Several CTEs are separated by commas, and each can use the ones above it:

```sql
WITH order_totals AS (
    SELECT o.customer_id, SUM(o.quantity * b.price) AS spent
    FROM orders AS o
    JOIN books AS b ON b.id = o.book_id
    GROUP BY o.customer_id
),
big_spenders AS (
    SELECT customer_id, spent
    FROM order_totals
    WHERE spent > 50
)
SELECT c.name, s.spent
FROM big_spenders AS s
JOIN customers AS c ON c.id = s.customer_id
ORDER BY s.spent DESC;
```

Each step has a name and can be tested on its own, by running `SELECT * FROM order_totals` in place of the last part.

## Subquery, join or CTE?

Often all three can express the same question.

| Situation | Usually clearest |
| --- | --- |
| compare with one computed value | scalar subquery |
| "has at least one" or "has none" | `EXISTS`, `NOT EXISTS` |
| need columns from both tables | join |
| several steps that build on each other | CTE |

Write the version that is easiest to read. The database's planner is good at finding an efficient way to run it.

## Recursive CTEs

A CTE can refer to itself, which lets SQL walk a hierarchy such as a company's management chain or a category tree:

```sql
WITH RECURSIVE numbers(n) AS (
    SELECT 1
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 5
)
SELECT n FROM numbers;
```

The first `SELECT` is the starting point. The second is applied again and again to the rows produced so far, until it yields nothing new.

## Common mistakes

- **A scalar subquery that returns more than one row.** That is an error at run time.
- **`NOT IN` over a column that can be NULL.**
- **A subquery in `FROM` with no alias.**
- **Deep nesting.** Three levels of brackets are a sign to switch to CTEs.
