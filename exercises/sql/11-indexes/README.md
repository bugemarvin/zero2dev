# Add the right indexes

This exercise needs a running PostgreSQL server (`./setup/install.sh --stack postgres`).

The bookshop is growing. Write the statements in `query.sql` that create three indexes:

1. An index on `orders` that speeds up `WHERE customer_id = ...`.
2. One index on `books` that serves queries filtering on `genre` and then on `price`, such as `WHERE genre = 'fiction' AND price < 15`.
3. A **unique** index on the `name` of `authors`, so that no two authors can share a name.

You may name the indexes as you like.

To look at a query plan yourself, load `seed.sql` into a database with `psql` and run `EXPLAIN SELECT * FROM orders WHERE customer_id = 3;` before and after. With so few rows PostgreSQL may still choose a sequential scan, which is the right choice for a tiny table.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/11-indexes`
