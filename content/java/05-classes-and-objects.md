---
title: Classes and objects
summary: Define your own types that keep data together with the methods that work on it, and protect their own rules.
---

## A class is a blueprint

A **class** describes a kind of thing. An **object** is one such thing, created with `new`.

```java
public class Dog {
    private String name;
    private int age;

    public Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void birthday() {
        age++;
    }
}
```

```java
Dog rex = new Dog("Rex", 3);
rex.birthday();
System.out.println(rex.getName());
```

- **Fields** (`name`, `age`) hold each object's data.
- The **constructor** has the same name as the class and no return type. It runs when `new` is called and sets up the fields.
- **Methods** without `static` are **instance methods**. They are called on an object and can use its fields.
- **`this`** is the object the method was called on. `this.name = name` separates the field from the parameter with the same name.

Each object has its own copy of the fields. `rex.birthday()` changes Rex and no other dog.

## Encapsulation

Make fields `private`, and offer `public` methods. Other code cannot then put an object into a state that makes no sense.

```java
public class BankAccount {
    private long balance;

    public void deposit(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
        balance += amount;
    }

    public long getBalance() {
        return balance;
    }
}
```

With a public field, any code could write `account.balance = -500`. Here the only way in is `deposit`, which checks.

| Modifier | Visible from |
| --- | --- |
| `private` | this class only |
| none | classes in the same package |
| `protected` | the same package, and subclasses |
| `public` | everywhere |

Start with `private`, and open up only what must be used from outside. Methods that read a field are called **getters**. Add a setter only when changing the field from outside really should be allowed.

## static and instance

| | Instance member | Static member |
| --- | --- | --- |
| Belongs to | each object | the class |
| Used as | `rex.getName()` | `Math.max(1, 2)` |
| Can use `this` | yes | no |

```java
public class Counter {
    private static int created = 0;    // one value, shared by all
    private int value = 0;             // one per object

    public Counter() {
        created++;
    }
}
```

## toString

Printing an object calls its `toString` method. The version you inherit prints something like `Dog@1b6d3586`. Provide your own:

```java
@Override
public String toString() {
    return "Dog(" + name + ", " + age + ")";
}
```

`@Override` asks the compiler to confirm that you really are replacing an inherited method. If you misspell the name, you get an error and not a silent bug.

## equals and hashCode

`==` asks whether two variables refer to the same object. To say when two **different** objects count as equal, override `equals`, and always `hashCode` with it:

```java
@Override
public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof Point)) return false;
    Point p = (Point) other;
    return x == p.x && y == p.y;
}

@Override
public int hashCode() {
    return java.util.Objects.hash(x, y);
}
```

The rule: objects that are equal must have the same hash code. If they do not, `HashMap` and `HashSet` cannot find them.

## Records

For a class that only carries data, a **record** writes the constructor, the accessors, `equals`, `hashCode` and `toString` for you:

```java
public record Point(int x, int y) {}

Point p = new Point(3, 4);
p.x()                                // 3
p.equals(new Point(3, 4))            // true
System.out.println(p);               // Point[x=3, y=4]
```

Records are immutable: their fields cannot change after creation.

## Immutability

An object that cannot change after it is built is easy to reason about, since nothing can alter it behind your back. Make fields `final` when they should never change:

```java
private final String owner;
```

## Common mistakes

- **Public fields.**
- **`name = name;` in a constructor.** That assigns the parameter to itself. Write `this.name = name;`.
- **Giving the constructor a return type**, such as `void Dog(...)`. It becomes an ordinary method, and the fields are never set.
- **Calling an instance method from `main` with no object.**
- **Overriding `equals` and not `hashCode`.**
