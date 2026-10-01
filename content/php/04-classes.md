---
title: Classes and objects
summary: Objects with private state, interfaces, exceptions of your own, and how projects are organised.
---

## A class

```php
class Product
{
    public function __construct(
        private string $name,
        private float $price,
    ) {
    }

    public function name(): string
    {
        return $this->name;
    }

    public function priceWithTax(float $rate): float
    {
        return round($this->price * (1 + $rate), 2);
    }
}

$mug = new Product("Mug", 9.0);
echo $mug->priceWithTax(0.16);
```

- `__construct` runs when the object is created with `new`.
- Writing `private string $name` in the constructor's parameter list declares the property and assigns it in one go. This is **constructor promotion**.
- `$this` is the object itself. Properties and methods are reached with `->`.

## Visibility

| Keyword | Reachable from |
| --- | --- |
| `public` | anywhere |
| `private` | inside this class only |
| `protected` | this class and classes that extend it |

Make properties `private` and offer methods. Then the class controls its own data: a balance cannot become negative unless a method allows it.

`readonly` properties can be set once, in the constructor:

```php
class Point
{
    public function __construct(
        public readonly int $x,
        public readonly int $y,
    ) {
    }
}
```

## Objects are handles

Unlike arrays, objects are **not copied** when assigned or passed:

```php
$a = new Counter();
$b = $a;
$b->increment();
echo $a->value();   // 1: one object, two variables
```

`clone $a` makes a copy.

## Static members and constants

```php
class Temperature
{
    public const FREEZING = 0.0;

    public static function fromFahrenheit(float $f): float
    {
        return ($f - 32) * 5 / 9;
    }
}

echo Temperature::FREEZING;
echo Temperature::fromFahrenheit(212);
```

## Interfaces

An interface lists methods. A class that `implements` it must have them all:

```php
interface Shape
{
    public function area(): float;
}

class Circle implements Shape
{
    public function __construct(private float $radius)
    {
    }

    public function area(): float
    {
        return M_PI * $this->radius ** 2;
    }
}

function totalArea(Shape ...$shapes): float
{
    return array_sum(array_map(fn(Shape $s) => $s->area(), $shapes));
}
```

`totalArea` works with every class that implements `Shape`, including ones written later.

## Inheritance

```php
class Animal
{
    public function __construct(protected string $name)
    {
    }

    public function describe(): string
    {
        return "{$this->name} makes a sound";
    }
}

class Dog extends Animal
{
    public function describe(): string
    {
        return "{$this->name} barks";
    }
}
```

`parent::describe()` calls the version of the parent class. Use inheritance sparingly: an interface plus small classes is usually easier to change.

## Your own exceptions

```php
class InsufficientFunds extends RuntimeException
{
}

throw new InsufficientFunds("balance too low");
```

Callers can then catch exactly that problem:

```php
try {
    $account->withdraw(500);
} catch (InsufficientFunds $e) {
    echo $e->getMessage();
} finally {
    // runs in every case
}
```

## Enums

```php
enum Status: string
{
    case Open = "open";
    case Closed = "closed";
}

$status = Status::from("open");
echo $status->value;
```

## Namespaces and Composer

Real projects put each class in its own file, inside a **namespace**:

```php
// src/Shop/Product.php
namespace App\Shop;

class Product
{
}
```

```php
use App\Shop\Product;
```

**Composer** is PHP's package manager. It also generates an **autoloader**, which loads a class file the first time the class is used:

```console
$ composer init
$ composer require guzzlehttp/guzzle
```

```php
require __DIR__ . '/vendor/autoload.php';
```

`composer.json` and `composer.lock` go into Git. The `vendor/` folder does not.

## Common mistakes

- **Public properties everywhere**, so any code can put the object in a broken state.
- **Forgetting `$this->`** when using a property inside a method.
- **Expecting an object to be copied** when it is assigned.
- **Deep inheritance trees.**
- **Catching `Exception` and doing nothing.** The error is hidden, not solved.
