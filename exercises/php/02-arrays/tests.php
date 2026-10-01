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

    eq('word_counts counts and sorts by word', word_counts("the cat The dog\nthe END"),
        ['cat' => 1, 'dog' => 1, 'end' => 1, 'the' => 3]);
    eq('word_counts of an empty text', word_counts('   '), []);
    eq('word_counts keys are in order', array_keys(word_counts('b a c a')), ['a', 'b', 'c']);

    eq('average of three numbers', average([2, 4, 9]), 5.0);
    eq('average of floats', average([1.5, 2.5]), 2.0);
    eq('average of nothing is 0.0', average([]), 0.0);

    $scores = ['sam' => 78, 'ada' => 91, 'linus' => 85, 'grace' => 91, 'bob' => 40];
    eq('top_scorers returns the best three names', top_scorers($scores, 3), ['ada', 'grace', 'linus']);
    eq('top_scorers with a limit of 1', top_scorers($scores, 1), ['ada']);
    eq('top_scorers with a limit larger than the list', top_scorers(['a' => 1, 'b' => 2], 5), ['b', 'a']);
    eq('top_scorers of nothing', top_scorers([], 3), []);

    $people = [
        ['name' => 'Kim', 'age' => 12],
        ['name' => 'Sam', 'age' => 30],
        ['name' => 'Lee', 'age' => 17],
        ['name' => 'Ada', 'age' => 18],
    ];
    eq('only_adults returns a plain list of names', only_adults($people), ['Sam', 'Ada']);
    eq('only_adults with nobody old enough', only_adults([['name' => 'Kim', 'age' => 3]]), []);
} catch (Throwable $e) {
    check('the tests run to the end', false, get_class($e) . ': ' . $e->getMessage() . ' (line ' . $e->getLine() . ')');
}

exit($failed ? 1 : 0);
