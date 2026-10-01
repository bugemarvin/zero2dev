---
title: Interfaces and inheritance
summary: Write code that works with many kinds of object through what they have in common.
---

## The problem

A drawing program has circles, rectangles and triangles. Code that adds up all their areas should not need a separate branch for each kind, nor a change every time a new shape is added.

## Interfaces

An **interface** is a contract: a list of methods that a class promises to provide.

```java
public interface Shape {
    double area();
    double perimeter();
}
```

A class signs the contract with `implements`, and must then provide every method:

```java
public class Circle implements Shape {
    private final double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }
}
```

## Polymorphism

A variable of type `Shape` can hold **any** object whose class implements `Shape`. Calling a method on it runs the version that belongs to the actual object.

```java
static double totalArea(List<Shape> shapes) {
    double total = 0;
    for (Shape s : shapes) {
        total += s.area();       // Circle's area, or Rectangle's, as appropriate
    }
    return total;
}
```

`totalArea` knows nothing about circles or rectangles. Add a `Triangle` class next year and this method works on it unchanged. That is the purpose of interfaces: code depends on **what an object can do**, not on what it is.

A class may implement several interfaces: `class Report implements Printable, Comparable<Report>`.

## Inheritance

A class can **extend** another. It receives all of the parent's fields and methods, and can add to them or replace them.

```java
public class Rectangle implements Shape {
    protected final double width;
    protected final double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() {
        return width * height;
    }

    @Override
    public double perimeter() {
        return 2 * (width + height);
    }
}

public class Square extends Rectangle {
    public Square(double side) {
        super(side, side);       // run Rectangle's constructor
    }
}
```

A `Square` **is a** `Rectangle`, so it is also a `Shape`, and it inherits `area` and `perimeter` with no further code.

- `super(...)` calls the parent's constructor. It must be the first statement.
- `super.method()` calls the parent's version of a method you have overridden.
- A class extends **one** class only. It may implement many interfaces.

## Overriding

A subclass replaces an inherited method by defining one with the same name and parameters. Mark it `@Override`:

```java
public class Animal {
    public String sound() {
        return "...";
    }
}

public class Cat extends Animal {
    @Override
    public String sound() {
        return "meow";
    }
}

Animal a = new Cat();
a.sound();        // "meow": the actual object decides, not the variable's type
```

## Abstract classes

An `abstract` class sits between the two ideas. It cannot be instantiated, and it can hold both finished methods and unfinished ones for subclasses to complete.

```java
public abstract class Employee {
    private final String name;

    protected Employee(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public abstract double monthlyPay();      // each subclass must supply this

    public String payslip() {
        return name + ": " + monthlyPay();
    }
}
```

| | Interface | Abstract class |
| --- | --- | --- |
| Fields | constants only | any |
| Constructors | no | yes |
| How many per class | many | one |
| Use it for | a capability | shared code among closely related classes |

## Default methods

An interface can supply a method body with `default`. Implementing classes inherit it and may override it.

```java
public interface Shape {
    double area();
    double perimeter();

    default String describe() {
        return "shape with area " + area();
    }
}
```

## Prefer interfaces and composition

Inheritance ties two classes together tightly: a change in the parent can break every child. Reach for it only when the "is a" relationship is true and will stay true.

When a class merely **uses** another, give it a field of that type. A `Car` has an `Engine`. It does not extend one.

## Common mistakes

- **Forgetting `@Override`.** A small spelling difference then creates a new method, and the old one keeps being called.
- **Extending a class just to reuse a few lines.**
- **Forgetting `super(...)`** when the parent has no constructor without arguments.
- **Testing types with `instanceof` in a long `if` chain.** That is usually a missing method on the interface.
