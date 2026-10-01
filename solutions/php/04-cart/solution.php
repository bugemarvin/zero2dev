<?php
declare(strict_types=1);

class OutOfStock extends RuntimeException
{
}

class Item
{
    public function __construct(
        private string $name,
        private float $price,
        private int $stock,
    ) {
        if ($price < 0 || $stock < 0) {
            throw new InvalidArgumentException('price and stock must not be negative');
        }
    }

    public function name(): string
    {
        return $this->name;
    }

    public function price(): float
    {
        return $this->price;
    }

    public function stock(): int
    {
        return $this->stock;
    }
}

class Cart implements Countable
{
    /** @var array<string, array{item: Item, quantity: int}> */
    private array $lines = [];

    public function add(Item $item, int $quantity = 1): void
    {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('quantity must be positive');
        }
        $wanted = $this->quantityOf($item->name()) + $quantity;
        if ($wanted > $item->stock()) {
            throw new OutOfStock("only {$item->stock()} of {$item->name()} in stock");
        }
        $this->lines[$item->name()] = ['item' => $item, 'quantity' => $wanted];
    }

    public function quantityOf(string $name): int
    {
        return $this->lines[$name]['quantity'] ?? 0;
    }

    public function count(): int
    {
        return array_sum(array_column($this->lines, 'quantity'));
    }

    public function total(): float
    {
        $sum = 0.0;
        foreach ($this->lines as $line) {
            $sum += $line['item']->price() * $line['quantity'];
        }
        return round($sum, 2);
    }

    public function remove(string $name): void
    {
        unset($this->lines[$name]);
    }
}
