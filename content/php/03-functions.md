---
title: Functions and types
summary: Typed parameters, default values, closures and match.
---

## Functions

```php
function greet(string $name, string $greeting = "Hello"): string
{
    return "$greeting, $name!";
}

echo greet("Sam");                  // Hello, Sam!
echo greet("Sam", "Welcome");       // Welcome, Sam!
echo greet(greeting: "Hi", name: "Ada");    // named arguments, in any order
```

- A type in front of each parameter, and a return type after the colon.
- A parameter with a default value can be left out.
- A function that returns nothing has the return type `void`.

Write the types. They document the function and, with `strict_types`, they are checked.

## Types you can write

| Type | Accepts |
| --- | --- |
| `int`, `float`, `string`, `bool`, `array` | that type |
| `?string` | a string or `null` |
| `int\|string` | either: a union type |
| `mixed` | anything |
| `callable` | a function |
| a class name | an object of that class |

## null

```php
function find_user(int $id): ?array
{
    return $users[$id] ?? null;
}

$name = $user["name"] ?? "guest";       // the fallback for missing or null
$city = $user?->address?->city;         // ?-> stops and gives null if the left side is null
```

## Scope

A function sees only its parameters and its own variables. It does **not** see variables from outside:

```php
$rate = 0.16;

function tax(float $amount): float
{
    return $amount * $rate;     // error: $rate is undefined here
}
```

Pass what the function needs as a parameter. That is a feature: a function that depends only on its arguments is easy to test.

## Closures

A function without a name, stored in a variable or passed to another function:

```php
$double = function (int $n): int {
    return $n * 2;
};

$rate = 0.16;
$withTax = function (float $amount) use ($rate): float {    // use brings in an outside variable
    return $amount * (1 + $rate);
};
```

The short form, an **arrow function**, sees outside variables automatically and holds one expression:

```php
$withTax = fn(float $amount): float => $amount * (1 + $rate);
$squares = array_map(fn($n) => $n * $n, [1, 2, 3]);
```

## match

`match` returns a value, compares with `===`, and throws an error when nothing matches:

```php
$label = match (true) {
    $score >= 90 => "A",
    $score >= 80 => "B",
    default => "C",
};

$days = match ($month) {
    "feb" => 28,
    "apr", "jun", "sep", "nov" => 30,
    default => 31,
};
```

Prefer it to `switch`, which compares loosely and falls through to the next case when you forget `break`.

## Any number of arguments

```php
function total(float ...$numbers): float
{
    return array_sum($numbers);
}

total(1, 2, 3);
total(...[4, 5]);       // spread an array into arguments
```

## Exceptions

A function that cannot do its job throws:

```php
function divide(int $a, int $b): float
{
    if ($b === 0) {
        throw new InvalidArgumentException("division by zero");
    }
    return $a / $b;
}

try {
    echo divide(1, 0);
} catch (InvalidArgumentException $e) {
    echo "error: ", $e->getMessage(), "\n";
}
```

## Several files

```php
require __DIR__ . '/helpers.php';
```

`__DIR__` is the folder of the current file, which makes the path work wherever the program is started from. Larger projects use Composer's autoloader and never write `require` for classes.

## Common mistakes

- **Expecting a function to see an outside variable.**
- **No types**, and bugs that types would have caught.
- **Returning different types** from the same function: an array on success and `false` on failure. Return `null` or throw.
- **`switch` without `break`.** Use `match`.
