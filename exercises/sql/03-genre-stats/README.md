# Statistics per genre

For each genre that has **at least two books**, show:

- `genre`
- `books`: the number of books
- `average_price`: the average price, rounded to 2 decimals

Order the rows by genre.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/03-genre-stats`
