# A shopping cart

Write the following in `solution.php`.

## `OutOfStock`

An exception class that extends `RuntimeException`.

## `Item`

Its constructor takes a `string $name`, a `float $price` and an `int $stock`. Offer the methods `name(): string`, `price(): float` and `stock(): int`. The properties are private.

A price below 0 or a stock below 0 throws an `InvalidArgumentException`.

## `Cart`

- `add(Item $item, int $quantity = 1): void` puts the item in the cart. Adding the same item again increases its quantity. A quantity of 0 or less throws an `InvalidArgumentException`. If the total quantity of that item would be larger than its stock, it throws `OutOfStock` and the cart does not change.
- `quantityOf(string $name): int` returns the quantity of that item in the cart, and 0 when it is not there.
- `count(): int` returns the total number of pieces in the cart.
- `total(): float` returns the sum of price times quantity, rounded to 2 decimals.
- `remove(string $name): void` takes the item out. Removing something that is not there does nothing.
- `Cart` implements the built-in interface `Countable`, so `count($cart)` works.
