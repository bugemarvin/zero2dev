---
title: Arrays
summary: One type for lists and for key-value data, and the functions that work on it.
---

## Lists

```php
$fruits = ["apple", "banana", "cherry"];
echo $fruits[0];            // apple
$fruits[] = "date";         // add to the end
echo count($fruits);        // 4
```

## Key-value arrays

The same type holds values under keys of your choice. PHP calls this an **associative array**:

```php
$user = [
    "name" => "Sam",
    "age" => 30,
];
echo $user["name"];
$user["email"] = "sam@example.com";
unset($user["age"]);
```

An array keeps the order in which its items were added.

## Looping

```php
foreach ($fruits as $fruit) {
    echo $fruit, "\n";
}

foreach ($user as $key => $value) {
    echo "$key: $value\n";
}
```

## Does a key exist?

```php
isset($user["email"])               // true if the key exists and is not null
array_key_exists("email", $user)    // true even when the value is null
$email = $user["email"] ?? "none";  // ?? gives the right side when the left is missing or null
```

Reading a key that does not exist produces a warning and gives `null`. Use `??` when a key may be missing.

## Counting with an array

```php
$counts = [];
foreach ($words as $word) {
    $counts[$word] = ($counts[$word] ?? 0) + 1;
}
```

## The array functions

| Function | Does |
| --- | --- |
| `count($a)` | number of items |
| `in_array($x, $a, true)` | is the value in it? Pass `true` for a strict comparison. |
| `array_keys($a)`, `array_values($a)` | the keys, or the values as a fresh list |
| `array_sum($a)`, `max($a)`, `min($a)` | totals and extremes |
| `array_merge($a, $b)` | both together |
| `array_slice($a, 1, 2)` | a part |
| `array_reverse($a)`, `array_unique($a)` | reversed, or without duplicates |
| `array_map($f, $a)` | a new array with `$f` applied to each item |
| `array_filter($a, $f)` | the items for which `$f` is true. The keys are kept. |
| `array_reduce($a, $f, $start)` | one value built from all items |

```php
$squares = array_map(fn($n) => $n * $n, [1, 2, 3]);                 // [1, 4, 9]
$even = array_values(array_filter([1, 2, 3, 4], fn($n) => $n % 2 === 0));   // [2, 4]
```

`array_filter` keeps the original keys, so the result above would be `[1 => 2, 3 => 4]` without `array_values`. That matters when you turn it into JSON: a list with gaps becomes an object.

## Sorting

Sorting changes the array **in place** and returns nothing useful:

| Function | Sorts by | Keeps keys |
| --- | --- | --- |
| `sort($a)`, `rsort($a)` | value | no |
| `asort($a)`, `arsort($a)` | value | yes |
| `ksort($a)`, `krsort($a)` | key | yes |
| `usort($a, $compare)` | your own rule | no |

```php
usort($people, fn($a, $b) => $a["age"] <=> $b["age"]);
```

`<=>` is the "spaceship" operator: it gives -1, 0 or 1.

## Arrays are copied

Assigning an array, or passing it to a function, gives a **copy**:

```php
$a = [1, 2];
$b = $a;
$b[] = 3;
echo count($a);     // 2
```

## Nested arrays

```php
$orders = [
    ["id" => 1, "total" => 9.5],
    ["id" => 2, "total" => 20.0],
];
echo $orders[1]["total"];
$totals = array_column($orders, "total");   // [9.5, 20.0]
```

## Common mistakes

- **`in_array` without `true`**, which compares with `==`.
- **Forgetting `array_values`** after `array_filter`.
- **`$sorted = sort($a)`**: `sort` returns `true` and changes `$a` itself.
- **Reading a missing key** and ignoring the warning.
