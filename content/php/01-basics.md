---
title: PHP basics
summary: Running PHP, variables, types, strings and decisions.
---

## What PHP is

PHP is a scripting language made for the web. WordPress, Wikipedia and Laravel applications run on it. A PHP file is run by the `php` program, from a terminal or by a web server for each request.

```php
<?php
echo "Hello, PHP\n";
```

```console
$ php hello.php
Hello, PHP
```

- A PHP file starts with `<?php`. Leave out the closing `?>` in files that contain only PHP.
- Every statement ends with a semicolon.
- `php -a` opens an interactive prompt, and `php -l file.php` checks a file for syntax errors without running it.

## Variables

Every variable starts with `$`. There is no declaration: assigning creates it.

```php
$name = "Sam";
$age = 30;
$price = 4.75;
$isMember = true;
$nothing = null;
```

| Type | Example |
| --- | --- |
| `int` | `42` |
| `float` | `4.75` |
| `string` | `"text"` |
| `bool` | `true`, `false` |
| `null` | `null`: no value |
| `array` | `[1, 2, 3]` |

`var_dump($value)` prints a value with its type. It is the first debugging tool to reach for.

## Strings

```php
$name = "Sam";
echo "Hello, $name!\n";            // double quotes: variables are filled in
echo 'Hello, $name!\n';            // single quotes: exactly as written
echo "Total: {$order['total']}\n"; // braces for anything more complex
echo "Hello, " . $name . "\n";     // . joins strings
```

Useful functions:

```php
strlen("hello")                 // 5 (bytes)
strtoupper("hello")             // "HELLO"
trim("  hi  ")                  // "hi"
str_contains("hello", "ell")    // true
str_replace("a", "b", "banana") // "bbnbnb"
explode(",", "a,b,c")           // ["a", "b", "c"]
implode("-", ["a", "b"])        // "a-b"
sprintf("%05.2f", 3.14159)      // "03.14"
number_format(1234.5, 2)        // "1,234.50"
```

## Numbers

```php
7 + 2      // 9
7 / 2      // 3.5: division gives a float
intdiv(7, 2)   // 3
7 % 2      // 1
2 ** 10    // 1024

(int) "42"         // 42: a cast
(float) "3.5"      // 3.5
```

## Decisions

```php
if ($age >= 18) {
    echo "adult\n";
} elseif ($age >= 13) {
    echo "teenager\n";
} else {
    echo "child\n";
}

$label = $age >= 18 ? "adult" : "minor";
```

## == and ===

This is the most important rule in PHP:

| Operator | Compares |
| --- | --- |
| `==` | the values, **after converting types** |
| `===` | the values **and** the types |

```php
var_dump(0 == "");        // false in PHP 8, true in PHP 7
var_dump("1" == "01");    // true: both look like numbers
var_dump(null == false);  // true
var_dump("1" === "01");   // false
```

**Always use `===` and `!==`.** The rules of `==` are too surprising to rely on.

## Strict types

Put this line at the top of every file, right after `<?php`:

```php
declare(strict_types=1);
```

Without it, PHP quietly converts `"5"` to `5` when a function expects an `int`. With it, that is an error. You find bugs when they are made, not weeks later.

## Loops

```php
for ($i = 0; $i < 3; $i++) {
    echo $i, "\n";
}

$n = 3;
while ($n > 0) {
    $n--;
}
```

## Reading input

From a terminal program:

```php
$line = trim(fgets(STDIN));
$all = stream_get_contents(STDIN);
```

## Common mistakes

- **Forgetting the `$`** or the semicolon.
- **Using `==`** where `===` was meant.
- **Variables inside single quotes**, which are not filled in.
- **`+` to join strings.** In PHP that is `.`.
- **A closing `?>` followed by a blank line**, which sends stray output.
