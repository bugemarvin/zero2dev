---
title: Tables and SELECT
summary: What a relational database is, and how to ask it for exactly the rows and columns you want.
---

## Tables

A relational database stores data in **tables**. A table has named **columns**, each with a type, and any number of **rows**. It looks like a spreadsheet, with stricter rules.

The exercises in this track use a small bookshop. Here is part of its `books` table:

| id | title | author_id | year | price | genre |
| --- | --- | --- | --- | --- | --- |
| 1 | The Silent River | 1 | 1998 | 12.50 | fiction |
| 2 | Night Trains | 1 | 2005 | 14.00 | fiction |
| 3 | Counting Stars | 2 | 2012 | 22.00 | science |

**SQL** is the language for working with tables. You describe **what** you want, and the database works out how to get it.

## SQL and PostgreSQL

SQL is a standard, and every database speaks its own dialect of it. **PostgreSQL** is a free, powerful database server used in a great many production systems. **SQLite** is a tiny database that lives in a single file, with no server.

Almost everything in this track is standard SQL and runs on both. Most exercises are checked with SQLite, which is built into Python, so they need nothing installed.

Two later exercises use features specific to PostgreSQL. For those the app looks for a PostgreSQL server on your machine and uses it. If there is none and Docker is installed, it starts one in a container named `z2d-postgres`, reachable only from your computer. You can also start it yourself:

```console
$ python3 check.py services up postgres
```

## SELECT

```sql
SELECT title, price
FROM books;
```

- `SELECT` lists the columns you want.
- `FROM` names the table.
- The semicolon ends the statement.

`SELECT *` means every column. It is handy for exploring and best avoided in real code, where naming the columns keeps things clear and stable.

Keywords are not case-sensitive. Writing them in capitals is a convention that makes queries easier to read.

## WHERE

`WHERE` keeps only the rows for which a condition is true.

```sql
SELECT title, price
FROM books
WHERE genre = 'fiction' AND price < 15;
```

Text values go in **single quotes**. Double quotes mean something else in SQL: they name columns and tables.

| Operator | Meaning |
| --- | --- |
| `=` | equal (one `=`, unlike most programming languages) |
| `<>` or `!=` | not equal |
| `<` `<=` `>` `>=` | comparisons |
| `AND` `OR` `NOT` | combine conditions |
| `BETWEEN 10 AND 20` | from 10 to 20, both included |
| `IN ('a', 'b')` | equal to any value in the list |
| `LIKE 'Th%'` | text pattern: `%` is any run of characters, `_` is exactly one |

```sql
SELECT title FROM books WHERE year BETWEEN 2000 AND 2010;
SELECT title FROM books WHERE genre IN ('science', 'history');
SELECT title FROM books WHERE title LIKE 'The %';
```

`AND` binds more tightly than `OR`. When you mix them, use brackets:

```sql
WHERE (genre = 'fiction' OR genre = 'poetry') AND price < 15
```

## NULL

`NULL` means "no value": unknown, or does not apply. It is not zero and not an empty string.

`NULL` is never equal to anything, not even to another `NULL`. So `WHERE city = NULL` matches **no rows at all**. Test for it with `IS NULL` and `IS NOT NULL`:

```sql
SELECT name FROM customers WHERE city IS NULL;
```

## Trying queries

Each SQL exercise has a file named `query.sql` where you write your answer, and a `seed.sql` that creates the sample tables.

In the app, **Show result** runs your query on the sample data and displays the table it returns, without judging it. **Run tests** then checks it.

In a terminal, the same two steps are:

```console
$ python3 check.py show sql/01-select-where
sql/01-select-where  result of query.sql
  title | price
  The Silent River | 12.5
  (1 row)
$ python3 check.py sql/01-select-where
```

To explore the data freely, load the seed file into a database shell:

```console
$ sqlite3 shop.db < exercises/sql/01-select-where/seed.sql
$ sqlite3 shop.db
sqlite> SELECT * FROM books;
```

With PostgreSQL the shell is `psql`, and `\i seed.sql` runs a file.

## Common mistakes

- **Double quotes around text.** Use `'fiction'`, not `"fiction"`.
- **`= NULL`.** It is always `IS NULL`.
- **`==`** in place of `=`.
- **Forgetting that text comparison is case-sensitive.** `'Fiction'` does not match `'fiction'`.
- **Mixing `AND` and `OR` with no brackets.**
