# How many books per author

Show every author's `name` and the number of books they have written, in a column called `books`.

**Authors with no books must appear too, with 0.**

Order by the number of books, highest first. Authors with the same number are ordered by name.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/05-books-per-author`
