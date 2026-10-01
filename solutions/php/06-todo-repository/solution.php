<?php
declare(strict_types=1);

class TodoRepository
{
    public function __construct(private PDO $pdo)
    {
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }

    public function createTable(): void
    {
        $this->pdo->exec('CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER NOT NULL DEFAULT 0
        )');
    }

    public function add(string $title): int
    {
        $title = trim($title);
        if ($title === '') {
            throw new InvalidArgumentException('title is required');
        }
        $statement = $this->pdo->prepare('INSERT INTO todos (title) VALUES (:title)');
        $statement->execute(['title' => $title]);
        return (int) $this->pdo->lastInsertId();
    }

    public function find(int $id): ?array
    {
        $statement = $this->pdo->prepare('SELECT id, title, done FROM todos WHERE id = :id');
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row ? $this->shape($row) : null;
    }

    public function all(bool $onlyOpen = false): array
    {
        $sql = 'SELECT id, title, done FROM todos' . ($onlyOpen ? ' WHERE done = 0' : '') . ' ORDER BY id';
        return array_map(fn(array $row) => $this->shape($row), $this->pdo->query($sql)->fetchAll());
    }

    public function complete(int $id): bool
    {
        $statement = $this->pdo->prepare('UPDATE todos SET done = 1 WHERE id = :id');
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $statement = $this->pdo->prepare('DELETE FROM todos WHERE id = :id');
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    public function addMany(array $titles): void
    {
        $this->pdo->beginTransaction();
        try {
            foreach ($titles as $title) {
                $this->add($title);
            }
            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    private function shape(array $row): array
    {
        return ['id' => (int) $row['id'], 'title' => $row['title'], 'done' => (bool) $row['done']];
    }
}
