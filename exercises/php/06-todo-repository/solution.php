<?php
declare(strict_types=1);

class TodoRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function createTable(): void
    {
    }
}
