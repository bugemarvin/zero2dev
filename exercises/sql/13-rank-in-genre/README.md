# Rank books within their genre

Show every book with its `title`, `genre`, `price` and a column called `position`: its rank by price **within its own genre**, where the most expensive book of a genre has position 1. Use `RANK()`.

Order the rows by genre, then position, then title.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/13-rank-in-genre`
