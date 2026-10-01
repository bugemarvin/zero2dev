# Who spent the most

The cost of an order is its `quantity` multiplied by the `price` of the book.

Show each customer's `name` and their total spending in a column called `spent`, for customers who spent **more than 40** in total. Order by `spent`, highest first.

This needs `orders`, `books` and `customers`. A CTE that computes the total per customer keeps it readable.

The bookshop has four tables. `seed.sql` in the exercise folder creates them.

| Table | Columns |
| --- | --- |
| `authors` | `id`, `name`, `country` |
| `books` | `id`, `title`, `author_id`, `year`, `price`, `genre` |
| `customers` | `id`, `name`, `city` |
| `orders` | `id`, `customer_id`, `book_id`, `quantity`, `ordered_on` |

Write your answer in `query.sql`. To see what it returns: `python3 check.py show sql/08-customer-spending`
