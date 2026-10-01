# A repository with PDO

Write the class `TodoRepository` in `solution.php`. Its constructor receives a `PDO` connection. The tests pass an in-memory SQLite database.

- `createTable(): void` creates the table `todos` with the columns `id` (integer primary key, auto-increment), `title` (text, not null) and `done` (integer, not null, default 0).
- `add(string $title): int` inserts a todo and returns its id. The title is trimmed. An empty title throws an `InvalidArgumentException`.
- `find(int $id): ?array` returns the todo as `['id' => 1, 'title' => '...', 'done' => false]`, or `null`. `id` is an `int` and `done` is a `bool`.
- `all(bool $onlyOpen = false): array` returns a list of todos in that same form, ordered by id. With `true` it returns only those that are not done.
- `complete(int $id): bool` marks a todo as done. It returns `true` when a row was changed, `false` when there is no such todo.
- `delete(int $id): bool` removes a todo, and returns whether one was removed.
- `addMany(array $titles): void` inserts all the titles **in one transaction**. If any title is empty, nothing is inserted and the `InvalidArgumentException` is thrown on.

Use prepared statements for every value. The tests try a title that would break a query built by joining strings.
