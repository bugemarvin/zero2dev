<?php
// Tests. Do not edit.
declare(strict_types=1);

$failed = false;

function check(string $name, bool $ok, string $detail = ''): void
{
    global $failed;
    if ($ok) {
        echo "ok - $name\n";
        return;
    }
    $failed = true;
    echo "not ok - $name: $detail\n";
}

function eq(string $name, mixed $got, mixed $want): void
{
    check($name, $got === $want, 'expected ' . json_encode($want) . ', got ' . json_encode($got));
}

function throws(string $name, string $class, callable $code, ?string $message = null): void
{
    try {
        $code();
    } catch (Throwable $e) {
        $ok = $e instanceof $class && ($message === null || $e->getMessage() === $message);
        check($name, $ok, 'got ' . get_class($e) . ': ' . $e->getMessage());
        return;
    }
    check($name, false, "expected a $class to be thrown, and nothing was");
}

set_error_handler(function (int $level, string $text, string $file, int $line) {
    throw new ErrorException($text, 0, $level, $file, $line);
});

try {
    require __DIR__ . '/solution.php';

    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $repo = new TodoRepository($pdo);
    $repo->createTable();
    $columns = array_column($pdo->query('PRAGMA table_info(todos)')->fetchAll(PDO::FETCH_ASSOC), 'name');
    eq('createTable makes the three columns', $columns, ['id', 'title', 'done']);
    eq('a new table is empty', $repo->all(), []);

    eq('add returns the new id', $repo->add('  Buy milk '), 1);
    eq('the second id is 2', $repo->add('Walk the dog'), 2);
    eq('find returns the todo, trimmed, with real types', $repo->find(1), ['id' => 1, 'title' => 'Buy milk', 'done' => false]);
    eq('find returns null for an unknown id', $repo->find(99), null);
    throws('an empty title is refused', InvalidArgumentException::class, fn() => $repo->add('   '));

    $nasty = "Robert'); DROP TABLE todos;--";
    $id = $repo->add($nasty);
    eq('a title full of SQL is stored as plain text', $repo->find($id)['title'] ?? null, $nasty);
    eq('and the table still exists', count($repo->all()), 3);

    eq('complete returns true for an existing todo', $repo->complete(2), true);
    eq('the todo is now done', $repo->find(2)['done'] ?? null, true);
    eq('complete returns false for an unknown id', $repo->complete(99), false);
    eq('all(true) returns only the open ones, by id', array_column($repo->all(true), 'id'), [1, 3]);
    eq('all() returns everything', array_column($repo->all(), 'id'), [1, 2, 3]);

    eq('delete returns true when a row was removed', $repo->delete(1), true);
    eq('delete returns false when there was none', $repo->delete(1), false);
    eq('the deleted todo is gone', $repo->find(1), null);

    $repo->addMany(['one', 'two']);
    eq('addMany inserts every title', count($repo->all()), 4);
    throws('addMany with an empty title throws', InvalidArgumentException::class, fn() => $repo->addMany(['three', '', 'four']));
    eq('and inserts none of them', count($repo->all()), 4);
    check('the transaction was closed', !$pdo->inTransaction(), 'a transaction is still open');
} catch (Throwable $e) {
    check('the tests run to the end', false, get_class($e) . ': ' . $e->getMessage() . ' (line ' . $e->getLine() . ')');
}

exit($failed ? 1 : 0);
