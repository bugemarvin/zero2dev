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

    eq('grade(95) is A', grade(95), 'A');
    eq('grade(90) is A', grade(90), 'A');
    eq('grade(85) is B', grade(85), 'B');
    eq('grade(70) is C', grade(70), 'C');
    eq('grade(0) is F', grade(0), 'F');
    throws('grade(101) throws', InvalidArgumentException::class, fn() => grade(101), 'score out of range');
    throws('grade(-1) throws', InvalidArgumentException::class, fn() => grade(-1), 'score out of range');

    eq('initials of two words', initials('ada lovelace'), 'AL');
    eq('initials of three words with extra spaces', initials('  grace  brewster hopper '), 'GBH');
    eq('initials of an empty name', initials(''), '');

    eq('the default discount is 10 percent', apply_discount(50.0), 45.0);
    eq('a discount of 25 percent', apply_discount(19.99, 25.0), 14.99);
    eq('a named argument works', apply_discount(percent: 50.0, price: 9.0), 4.5);

    $counter = make_counter();
    eq('a counter starts at 0', $counter(), 0);
    eq('then gives 1', $counter(), 1);
    eq('then gives 2', $counter(), 2);
    $other = make_counter(10);
    eq('another counter starts where it is told', $other(), 10);
    eq('and does not disturb the first', $counter(), 3);

    eq('sum_all adds its arguments', sum_all(1, 2, 3, 4), 10);
    eq('sum_all with none is 0', sum_all(), 0);
    eq('sum_all accepts a spread array', sum_all(...[5, 5]), 10);
} catch (Throwable $e) {
    check('the tests run to the end', false, get_class($e) . ': ' . $e->getMessage() . ' (line ' . $e->getLine() . ')');
}

exit($failed ? 1 : 0);
