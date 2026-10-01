# Books above the average price

Show the `title` and `price` of every book that costs more than the average price of all books.

Order by price, highest first, then by title.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/06-above-average`
