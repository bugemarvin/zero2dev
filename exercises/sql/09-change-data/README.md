# Insert, update, delete

Write a script in `query.sql` that makes four changes to the bookshop:

1. Add an author with id `7`, name `Nina Park`, country `Korea`.
2. Add a book with id `13`: title `Tidal`, by that author, year `2024`, price `18.00`, genre `fiction`.
3. Raise the price of every **science** book by 10%.
4. Delete every order placed **before 1 February 2024**.

The checker runs your script on a fresh copy of the data and then inspects the tables.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/09-change-data`
