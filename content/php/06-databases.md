---
title: Databases with PDO
summary: Talk to a SQL database safely: prepared statements, transactions and password hashing.
---

## PDO

**PDO** (PHP Data Objects) is the standard way to use a SQL database from PHP. The same code works with SQLite, PostgreSQL and MySQL. Only the connection string changes.

```php
$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
// $pdo = new PDO('pgsql:host=127.0.0.1;dbname=shop', 'user', 'password');
// $pdo = new PDO('mysql:host=127.0.0.1;dbname=shop;charset=utf8mb4', 'user', 'password');

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
```

The two settings make every database error an exception, and make rows come back as arrays keyed by column name. Since PHP 8, exceptions are the default.

`sqlite::memory:` is a database that lives in memory and disappears when the script ends. It is ideal for tests.

If SQL is new to you, read [the SQL track](sql/01-select) first.

## Running statements

```php
$pdo->exec('CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
)');
```

## Prepared statements

**Never** put a value into SQL text yourself:

```php
// DANGEROUS
$pdo->query("SELECT * FROM users WHERE email = '$email'");
```

If `$email` is `' OR '1'='1`, the query returns every user. This is **SQL injection**, and it has leaked more data than any other mistake.

A **prepared statement** sends the SQL and the values separately. The database never mistakes a value for SQL:

```php
$statement = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$statement->execute(['email' => $email]);
$user = $statement->fetch();        // one row as an array, or false when there is none
```

Use a placeholder for **every** value that comes from outside. No exceptions.

## Reading rows

```php
$statement = $pdo->prepare('SELECT id, name FROM users WHERE name LIKE :pattern ORDER BY name');
$statement->execute(['pattern' => 'S%']);

$all = $statement->fetchAll();              // every row
$names = $statement->fetchAll(PDO::FETCH_COLUMN, 1);   // one column as a plain list

$count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
```

## Writing rows

```php
$statement = $pdo->prepare('INSERT INTO users (email, name) VALUES (:email, :name)');
$statement->execute(['email' => 'sam@example.com', 'name' => 'Sam']);
$id = (int) $pdo->lastInsertId();

$statement = $pdo->prepare('UPDATE users SET name = :name WHERE id = :id');
$statement->execute(['name' => 'Samuel', 'id' => $id]);
$changed = $statement->rowCount();          // how many rows were affected
```

A broken rule, such as a duplicate email in a `UNIQUE` column, throws a `PDOException`.

## Transactions

Changes that belong together must all happen or none:

```php
$pdo->beginTransaction();
try {
    $pdo->prepare('UPDATE accounts SET balance = balance - :n WHERE id = :id')
        ->execute(['n' => 50, 'id' => 1]);
    $pdo->prepare('UPDATE accounts SET balance = balance + :n WHERE id = :id')
        ->execute(['n' => 50, 'id' => 2]);
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
```

## A repository class

Keep SQL in one place, behind methods with clear names. The rest of the program then knows nothing about tables:

```php
class UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->pdo->prepare('SELECT * FROM users WHERE email = :email');
        $statement->execute(['email' => $email]);
        return $statement->fetch() ?: null;
    }
}
```

The `PDO` object is **passed in**. A test hands over an in-memory database, and production hands over the real one. This is called **dependency injection**, and it is the reason the class is easy to test.

## Passwords

Never store a password. Store a **hash**:

```php
$hash = password_hash($password, PASSWORD_DEFAULT);     // store this
if (password_verify($typed, $hash)) {
    // correct
}
```

`password_hash` uses a slow algorithm with a random salt, which is exactly what protects passwords when a database leaks. Never use `md5` or `sha1` for passwords: they are fast, and fast is the problem.

## Common mistakes

- **Building SQL by joining strings with user input.**
- **Storing passwords** as plain text or as md5.
- **Not checking the result of `fetch`**, which is `false` when no row matches.
- **Forgetting `rollBack`** when a step of a transaction fails.
- **Creating a new connection inside every function** in place of passing one in.
