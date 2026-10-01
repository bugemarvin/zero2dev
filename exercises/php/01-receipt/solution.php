<?php
declare(strict_types=1);

$tokens = preg_split('/\s+/', trim(stream_get_contents(STDIN)));
$name = $tokens[0];
$price = (float) $tokens[1];
$quantity = (int) $tokens[2];

echo "Item: $name\n";
