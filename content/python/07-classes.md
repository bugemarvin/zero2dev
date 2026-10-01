---
title: Classes
summary: Bundle data with the functions that work on it, and make your own types behave like built-in ones.
---

## A class and its objects

A **class** is a blueprint. An **object** (or instance) is one thing built from it.

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says woof"

rex = Dog("Rex", 3)
rex.name          # 'Rex'
rex.bark()        # 'Rex says woof'
```

- `__init__` runs when an object is created. It sets up the object's data.
- `self` is the object itself. Every method receives it as its first parameter. Python fills it in, so you call `rex.bark()` with no arguments.
- `self.name` is an **attribute**: a variable that belongs to this one object.

Each object has its own attributes. Changing `rex.age` does not affect any other dog.

## Why use a class

When several pieces of data always travel together, and a set of functions always works on them, a class keeps them in one place. It can also protect its own rules:

```python
class BankAccount:
    def __init__(self, owner):
        self.owner = owner
        self._balance = 0

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    @property
    def balance(self):
        return self._balance
```

- The leading underscore in `_balance` is a convention meaning *internal, do not touch from outside*.
- `@property` makes `balance` readable like an attribute, `account.balance`, with no way to assign to it. All changes must go through `deposit`, which checks the amount.

## Special methods

Methods with double underscores let your objects work with Python's own syntax.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __eq__(self, other):
        return isinstance(other, Vector) and self.x == other.x and self.y == other.y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

Vector(1, 2) + Vector(3, 4)     # Vector(4, 6)
Vector(1, 2) == Vector(1, 2)    # True
```

| Method | Makes this work |
| --- | --- |
| `__repr__` | what the object looks like when printed or shown in the prompt |
| `__eq__` | `a == b` |
| `__add__` | `a + b` |
| `__len__` | `len(a)` |
| `__lt__` | `a < b`, and therefore sorting |
| `__contains__` | `x in a` |

Without `__eq__`, two objects are equal only if they are the very same object. Without `__repr__`, printing shows something like `<Vector object at 0x7f...>`. Write `__repr__` for every class. It makes debugging far easier.

## Inheritance

A class can extend another. It gets all of the parent's methods and can add or replace some.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def introduce(self):
        return f"{self.name}: {self.speak()}"

class Cat(Animal):
    def speak(self):
        return "meow"

Cat("Tom").introduce()     # 'Tom: meow'
```

`super()` calls the parent's version, most often in `__init__`:

```python
class Kitten(Cat):
    def __init__(self, name, weeks):
        super().__init__(name)
        self.weeks = weeks
```

Use inheritance when the new class truly **is a** kind of the old one. When it only *uses* another object, store that object as an attribute.

## Dataclasses

For classes that mainly hold data, `@dataclass` writes `__init__`, `__repr__` and `__eq__` for you:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(1.5, 2.0)
p                       # Point(x=1.5, y=2.0)
p == Point(1.5, 2.0)    # True
```

## Common mistakes

- **Forgetting `self`** in a method's parameter list. The error says the method received one argument more than it takes.
- **Writing `name = name` in `__init__`.** That assigns a local variable to itself. Write `self.name = name`.
- **A list as a class-level attribute.** It is shared by every object. Create it inside `__init__`.
- **Deep inheritance chains.** Two levels are usually plenty.
