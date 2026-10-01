# Design two tables

A small library needs two tables. Write the `CREATE TABLE` statements in `query.sql`.

**`members`**

| Column | Rules |
| --- | --- |
| `id` | whole number, the primary key |
| `email` | text, required, no two members may share one |
| `name` | text, required |
| `joined_on` | a date, required, defaults to today's date |

**`loans`**

| Column | Rules |
| --- | --- |
| `id` | whole number, the primary key |
| `member_id` | required, must refer to an existing member |
| `book_title` | text, required |
| `days` | whole number, required, from 1 to 30 inclusive |

The checker creates your tables and then tries to insert good and bad rows. The good ones must be accepted and the bad ones rejected.
