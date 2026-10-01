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

    $mug = new Item('Mug', 9.5, 3);
    $pen = new Item('Pen', 1.25, 100);
    eq('an item gives its name, price and stock', [$mug->name(), $mug->price(), $mug->stock()], ['Mug', 9.5, 3]);
    throws('a negative price is refused', InvalidArgumentException::class, fn() => new Item('Bad', -1.0, 1));
    throws('a negative stock is refused', InvalidArgumentException::class, fn() => new Item('Bad', 1.0, -1));
    check('the properties are private', !array_key_exists('name', get_object_vars($mug)), 'name is public');

    $cart = new Cart();
    eq('a new cart is empty', [$cart->count(), $cart->total()], [0, 0.0]);
    $cart->add($mug);
    $cart->add($pen, 4);
    eq('quantityOf after adding', [$cart->quantityOf('Mug'), $cart->quantityOf('Pen')], [1, 4]);
    eq('quantityOf something absent is 0', $cart->quantityOf('Hat'), 0);
    eq('count is the number of pieces', $cart->count(), 5);
    eq('total is price times quantity', $cart->total(), 14.5);
    $cart->add($mug, 2);
    eq('adding the same item again increases its quantity', $cart->quantityOf('Mug'), 3);
    throws('more than the stock throws OutOfStock', OutOfStock::class, fn() => $cart->add($mug));
    eq('and the cart is unchanged', $cart->quantityOf('Mug'), 3);
    check('OutOfStock is a RuntimeException', is_subclass_of(OutOfStock::class, RuntimeException::class), '');
    throws('a quantity of 0 is refused', InvalidArgumentException::class, fn() => $cart->add($pen, 0));
    check('Cart implements Countable', $cart instanceof Countable && count($cart) === 7, 'count($cart) should be 7');
    $cart->remove('Mug');
    eq('remove takes the item out', [$cart->quantityOf('Mug'), $cart->count(), $cart->total()], [0, 4, 5.0]);
    $cart->remove('Hat');
    eq('removing something absent does nothing', $cart->count(), 4);
} catch (Throwable $e) {
    check('the tests run to the end', false, get_class($e) . ': ' . $e->getMessage() . ' (line ' . $e->getLine() . ')');
}

exit($failed ? 1 : 0);
