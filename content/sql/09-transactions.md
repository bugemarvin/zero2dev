---
title: Transactions
summary: Group several changes so that they all happen or none of them do.
---

## The problem

Moving 40 from Alice's account to Bob's takes two statements:

```sql
UPDATE accounts SET balance = balance - 40 WHERE name = 'alice';
UPDATE accounts SET balance = balance + 40 WHERE name = 'bob';
```

If the program crashes between them, 40 has left Alice and never reached Bob. The money is gone.

## BEGIN, COMMIT, ROLLBACK

A **transaction** wraps statements into one unit:

```sql
BEGIN;

UPDATE accounts SET balance = balance - 40 WHERE name = 'alice';
UPDATE accounts SET balance = balance + 40 WHERE name = 'bob';

COMMIT;
```

- `BEGIN` starts the transaction.
- `COMMIT` makes all its changes permanent, together.
- `ROLLBACK` throws all of them away, as if nothing had happened.

If anything fails before `COMMIT`, whether an error, a crash or a lost connection, the database rolls the whole transaction back by itself.

## Rolling back on purpose

A transaction is also a safety net for risky manual work:

```sql
BEGIN;

DELETE FROM orders WHERE ordered_on < '2024-01-01';

SELECT COUNT(*) FROM orders;     -- look at the result before deciding

ROLLBACK;                        -- not what you wanted? undo it
```

Until you commit, the changes are visible only inside your own session.

## ACID

Transactions give four guarantees, known by their initials.

| Property | Promise |
| --- | --- |
| **Atomicity** | all of the transaction happens, or none of it |
| **Consistency** | constraints hold before and after. A transaction that would break one is rejected. |
| **Isolation** | transactions running at the same time do not see each other's unfinished work |
| **Durability** | once committed, the changes survive a crash or power cut |

## Constraints and transactions together

A `CHECK` constraint can make an impossible state unrepresentable:

```sql
CREATE TABLE accounts (
    name     TEXT PRIMARY KEY,
    balance  INTEGER NOT NULL CHECK (balance >= 0)
);
```

A withdrawal that would make a balance negative now fails. Inside a transaction, that failure cancels the matching deposit too. The rule lives in the schema, and the transaction makes sure it cannot be half-applied.

In PostgreSQL, once a statement inside a transaction fails, every later statement is refused until you issue `ROLLBACK`.

## Every statement is a transaction

A single statement run outside `BEGIN` and `COMMIT` is its own small transaction, committed at once. This is called **autocommit**. An `UPDATE` that changes a thousand rows changes all thousand or none.

## Running at the same time

When two transactions touch the same rows, the database coordinates them with **locks**. If both try to update the same row, the second waits until the first commits or rolls back.

How much one transaction may see of others is set by the **isolation level**.

| Level | Behaviour |
| --- | --- |
| Read committed | each statement sees data committed before that statement began. The default in PostgreSQL. |
| Repeatable read | the whole transaction sees one snapshot, taken at its start |
| Serializable | the result is the same as if the transactions had run one after another |

Stricter levels prevent more surprises. Under them the database sometimes cancels a transaction, and the application must try it again.

## Lost updates

Two people read a stock count of 5 at the same moment. Each subtracts 1 in their program and writes back 4. One sale has vanished.

Let the database do the arithmetic, in one statement:

```sql
UPDATE stock SET quantity = quantity - 1 WHERE book_id = 3;
```

Or lock the row when you read it, so that nobody else can change it until you commit:

```sql
SELECT quantity FROM stock WHERE book_id = 3 FOR UPDATE;
```

## Deadlocks

Transaction A locks row 1 and wants row 2. Transaction B locks row 2 and wants row 1. Neither can go on. The database detects this, cancels one of them, and that one must be retried. Always locking rows in the same order, for example by ascending ID, avoids it.

## Keep them short

A transaction holds its locks until it ends. A long one blocks other work. Do not keep a transaction open while waiting for a person to click something or for a network call to return.

## Common mistakes

- **Related changes with no transaction.**
- **Forgetting to `COMMIT`.** The work disappears when the connection closes.
- **Read, compute in the application, write back**, with no lock.
- **Long transactions.**
- **Ignoring errors in the middle** and carrying on.
