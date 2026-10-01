---
title: Changing data
summary: Add rows, change them and remove them, without wrecking the table by accident.
---

## INSERT

```sql
INSERT INTO authors (id, name, country)
VALUES (7, 'Nina Park', 'Korea');
```

List the columns, then the values in the same order. Naming the columns means the statement keeps working if someone later adds a column to the table.

Several rows at once:

```sql
INSERT INTO authors (id, name, country)
VALUES (8, 'Omar Haddad', 'Egypt'),
       (9, 'Ines Costa', 'Portugal');
```

A column you leave out receives its **default** value, or `NULL` if it has none.

You can also insert the result of a query:

```sql
INSERT INTO cheap_books (title, price)
SELECT title, price FROM books WHERE price < 10;
```

## UPDATE

```sql
UPDATE books
SET price = 13.00
WHERE id = 1;
```

The new value may be computed from the old one, and several columns can change together:

```sql
UPDATE books
SET price = price * 1.10,
    genre = 'popular science'
WHERE genre = 'science';
```

## DELETE

```sql
DELETE FROM orders
WHERE ordered_on < '2024-02-01';
```

## The WHERE clause is everything

> **Warning:** `UPDATE` and `DELETE` with no `WHERE` apply to **every row in the table**. `DELETE FROM orders;` empties it. There is no undo once the change is committed.

A habit that prevents disasters: write the `WHERE` as a `SELECT` first.

```sql
SELECT * FROM orders WHERE ordered_on < '2024-02-01';
```

Check that it returns exactly the rows you intend to remove. Then change `SELECT *` into `DELETE`, keeping the condition.

A second safety net is to work inside a [transaction](sql/09-transactions), which you can roll back.

## Keys make changes safe

To change one specific row, identify it by its primary key. `WHERE name = 'Sam'` might match three people. `WHERE id = 42` matches at most one.

## Foreign keys protect you

If a table has a foreign key, the database refuses changes that would leave a row pointing at nothing:

```sql
DELETE FROM authors WHERE id = 1;
-- ERROR: update or delete on table "authors" violates foreign key constraint
```

Author 1 still has books. Delete or reassign the books first. That refusal is a feature: it keeps the data consistent.

## RETURNING

PostgreSQL, and recent versions of SQLite, can hand back the rows a statement touched:

```sql
UPDATE books
SET price = price * 1.10
WHERE genre = 'science'
RETURNING id, title, price;
```

It is especially useful after an `INSERT` into a table that generates its own IDs, to learn which ID the new row received.

## Insert or update

When a row may or may not exist already, PostgreSQL and SQLite can do both in one statement:

```sql
INSERT INTO stock (book_id, quantity)
VALUES (3, 5)
ON CONFLICT (book_id)
DO UPDATE SET quantity = stock.quantity + 5;
```

If inserting would break the unique rule on `book_id`, the existing row is updated instead. This is often called an **upsert**.

## Common mistakes

- **Forgetting `WHERE`.**
- **Testing against the real database.** Try changes on a copy, or inside a transaction.
- **Inserting with no column list.** It breaks when the table gains a column.
- **Deleting a parent row before its children.**
- **`UPDATE ... SET a = 1 AND b = 2`.** Separate the assignments with commas, not `AND`.
