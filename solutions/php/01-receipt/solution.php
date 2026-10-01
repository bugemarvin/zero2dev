<?php
declare(strict_types=1);

$tokens = preg_split('/\s+/', trim(stream_get_contents(STDIN)));
$name = $tokens[0];
$price = (float) $tokens[1];
$quantity = (int) $tokens[2];
$total = $price * $quantity;

echo "Item: $name\n";
echo "Quantity: $quantity\n";
echo "Total: " . number_format($total, 2, '.', '') . "\n";
echo $total >= 10 ? "Big order\n" : "Small order\n";
