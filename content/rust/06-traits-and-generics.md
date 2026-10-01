---
title: Traits and generics
summary: Shared behaviour, and code that works for many types with no cost at run time.
---

## Traits

A **trait** is a set of methods a type can implement. It is Rust's version of an interface:

```rust
trait Describe {
    fn describe(&self) -> String;
}

struct Dog {
    name: String,
}

struct Robot {
    id: u32,
}

impl Describe for Dog {
    fn describe(&self) -> String {
        format!("a dog named {}", self.name)
    }
}

impl Describe for Robot {
    fn describe(&self) -> String {
        format!("robot #{}", self.id)
    }
}
```

Unlike Go, the implementation is written out: `impl Trait for Type`.

A trait can supply a **default method**, which types may keep or replace:

```rust
trait Describe {
    fn describe(&self) -> String;

    fn shout(&self) -> String {
        self.describe().to_uppercase()
    }
}
```

## Generics

A generic function works for any type that meets its requirements, the **trait bounds**:

```rust
fn largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T> {
    let mut best = *items.first()?;
    for &item in items {
        if item > best {
            best = item;
        }
    }
    Some(best)
}

largest(&[3, 9, 2]);            // T is i32
largest(&[1.5, 0.2]);           // T is f64
```

`T: PartialOrd + Copy` reads: "any type `T` that can be compared and copied". Without the bound, the compiler refuses `item > best`, because it would not hold for every type.

The compiler generates a separate, specialised version of the function for each type used. Generic code runs as fast as code written by hand for one type. This is called a **zero-cost abstraction**.

Structs can be generic too:

```rust
struct Pair<T> {
    first: T,
    second: T,
}

impl<T: PartialOrd> Pair<T> {
    fn larger(&self) -> &T {
        if self.first > self.second { &self.first } else { &self.second }
    }
}
```

`Option<T>`, `Vec<T>` and `Result<T, E>` are ordinary generic types.

## Taking "anything that implements"

Two ways to accept any type with a trait:

```rust
fn print_it(item: &impl Describe) {         // decided at compile time: fastest
    println!("{}", item.describe());
}

fn print_all(items: &[Box<dyn Describe>]) { // decided at run time: allows a mixed list
    for item in items {
        println!("{}", item.describe());
    }
}

let zoo: Vec<Box<dyn Describe>> = vec![
    Box::new(Dog { name: String::from("Rex") }),
    Box::new(Robot { id: 7 }),
];
```

`dyn Describe` is a **trait object**. A `Box` puts the value on the heap, which is needed because a dog and a robot have different sizes. Use `impl Trait` by default, and `dyn Trait` when one collection must hold different types.

## Traits you meet every day

| Trait | Gives | Usually |
| --- | --- | --- |
| `Debug` | `{:?}` | derived |
| `Clone`, `Copy` | copies | derived |
| `PartialEq`, `Eq` | `==` | derived |
| `PartialOrd`, `Ord` | `<`, sorting | derived |
| `Default` | `Type::default()` | derived |
| `Display` | `{}` | written by hand |
| `From`, `Into` | conversions | written by hand |
| `Iterator` | `for` loops | written by hand |

Implementing `Display` decides how your type prints with `{}`:

```rust
use std::fmt;

impl fmt::Display for Robot {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Robot({})", self.id)
    }
}

println!("{}", Robot { id: 7 });        // Robot(7)
```

## Common mistakes

- **A generic function with no bounds** that then tries to compare or print its values.
- **`dyn` everywhere** out of habit from object-oriented languages. Generics are usually simpler and faster.
- **Forgetting to bring a trait into scope** with `use`. A trait's methods are available only where the trait is imported.
