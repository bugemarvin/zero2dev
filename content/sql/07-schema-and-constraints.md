---
title: Designing tables
summary: Create tables with types and constraints, so that the database itself rejects bad data.
---

## CREATE TABLE

```sql
CREATE TABLE members (
    id         INTEGER PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    name       TEXT NOT NULL,
    joined_on  DATE NOT NULL DEFAULT CURRENT_DATE
);
```

Each line is a column: its name, its type and its constraints.

## Types

| Type | Holds |
| --- | --- |
| `INTEGER`, `BIGINT` | whole numbers |
| `NUMERIC(10, 2)` | exact decimals. Use this for money. |
| `REAL`, `DOUBLE PRECISION` | floating point: fast and inexact |
| `TEXT`, `VARCHAR(n)` | text |
| `BOOLEAN` | true or false |
| `DATE`, `TIMESTAMP` | a day, a moment in time |

Never store money in a floating-point column. `0.1 + 0.2` is not exactly `0.3` there.

PostgreSQL enforces types strictly. SQLite is relaxed and will store text in an `INTEGER` column, so do not rely on it to catch type mistakes.

## Constraints

A constraint is a rule the database enforces on **every** insert and update, whichever program sends it. Rules in application code can be bypassed or forgotten. Rules in the schema cannot.

| Constraint | Rule |
| --- | --- |
| `PRIMARY KEY` | identifies the row: unique and never NULL |
| `NOT NULL` | a value is required |
| `UNIQUE` | no two rows may share this value |
| `DEFAULT value` | used when no value is given |
| `CHECK (condition)` | the condition must hold |
| `REFERENCES table(column)` | a foreign key: the value must exist in the other table |

```sql
CREATE TABLE loans (
    id          INTEGER PRIMARY KEY,
    member_id   INTEGER NOT NULL REFERENCES members(id),
    book_title  TEXT NOT NULL,
    days        INTEGER NOT NULL CHECK (days BETWEEN 1 AND 30)
);
```

With that in place:

```sql
INSERT INTO loans (id, member_id, book_title, days) VALUES (1, 999, 'Dune', 14);
-- rejected: there is no member 999

INSERT INTO loans (id, member_id, book_title, days) VALUES (2, 1, 'Dune', 90);
-- rejected: days must be between 1 and 30
```

## Primary keys

Every table should have one. The usual choice is an ID that the database generates:

```sql
id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY    -- PostgreSQL
id INTEGER PRIMARY KEY                                 -- SQLite assigns one automatically
```

A generated ID never needs to change. Real-world values such as email addresses do change, which makes them poor primary keys. Give them a `UNIQUE` constraint.

## Relationships

**One to many:** an author has many books. The "many" side holds the foreign key: `books.author_id`.

**Many to many:** a student takes many courses, and a course has many students. This needs a third table with one row for each pairing:

```sql
CREATE TABLE enrolments (
    student_id  INTEGER NOT NULL REFERENCES students(id),
    course_id   INTEGER NOT NULL REFERENCES courses(id),
    PRIMARY KEY (student_id, course_id)
);
```

The two-column primary key prevents enrolling the same student in the same course twice.

## Normalisation in three rules

Normalisation means organising tables so that each fact is stored **once**.

1. **One value per cell.** No lists in a column. `phones = '555-1234, 555-9876'` should be a separate table of phone numbers.
2. **No repeated groups.** Columns named `book1`, `book2`, `book3` are a "many" relationship trying to get out. Make a table.
3. **Each column depends on the key, and only the key.** If `orders` stores both `customer_id` and `customer_city`, the city is a fact about the customer, not about the order. It belongs in `customers`.

Duplicated facts drift apart. One copy gets updated, the other does not, and nobody knows which is right.

## Changing a table later

```sql
ALTER TABLE members ADD COLUMN phone TEXT;
ALTER TABLE members RENAME COLUMN name TO full_name;
DROP TABLE loans;
```

On a real project, schema changes are written as numbered **migration** files and committed to Git, so that every copy of the database goes through the same changes in the same order.

## What to do when a parent row is deleted

A foreign key can say what happens to the children:

```sql
member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE
```

| Option | Effect when the parent row is deleted |
| --- | --- |
| default | the delete is refused |
| `ON DELETE CASCADE` | the child rows are deleted too |
| `ON DELETE SET NULL` | the foreign key in the children becomes NULL |

## Common mistakes

- **No primary key.**
- **Everything nullable.** Add `NOT NULL` unless "unknown" really is a valid state.
- **Floating point for money.**
- **Lists inside a column.**
- **Validating only in application code.** Put the rule in the schema too.
