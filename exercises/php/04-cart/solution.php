<?php
declare(strict_types=1);

class OutOfStock extends RuntimeException
{
}

class Item
{
    public function __construct(string $name, float $price, int $stock)
    {
    }
}

class Cart
{
}
