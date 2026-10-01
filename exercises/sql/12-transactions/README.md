# Transfer money safely

`seed.sql` creates a small bank:

| Table | Columns |
| --- | --- |
| `accounts` | `name`, `balance` (never negative) |
| `transfers` | `id`, `from_name`, `to_name`, `amount` |

Alice has 100, Bob has 50 and Carol has 0.

Write a script in `query.sql` with **two transactions**.

**1. A transfer that is committed.** In one transaction:

- take 40 from `alice`,
- add 40 to `bob`,
- record it in `transfers` with id `1`.

**2. A mistake that is rolled back.** In a second transaction, delete every row from `transfers` and then from `accounts`, and then roll the transaction back, so that nothing is lost.

The script must use `BEGIN`, `COMMIT` and `ROLLBACK`.
