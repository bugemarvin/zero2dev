---
title: Structs, enums and match
summary: Model your data so that wrong states cannot even be written.
---

## Structs

```rust
struct Point {
    x: f64,
    y: f64,
}

let p = Point { x: 3.0, y: 4.0 };
println!("{}", p.x);
```

Methods go in an `impl` block:

```rust
impl Point {
    fn new(x: f64, y: f64) -> Point {            // an associated function: Point::new(1.0, 2.0)
        Point { x, y }
    }

    fn distance_from_origin(&self) -> f64 {      // a method: p.distance_from_origin()
        (self.x * self.x + self.y * self.y).sqrt()
    }

    fn move_by(&mut self, dx: f64, dy: f64) {    // a method that changes the point
        self.x += dx;
        self.y += dy;
    }
}
```

The first parameter says what the method does with the value, with the same three choices as any function: `&self` looks, `&mut self` changes, `self` takes ownership.

## derive

One line gives a struct common abilities:

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}
```

| Trait | Gives you |
| --- | --- |
| `Debug` | printing with `{:?}` |
| `Clone` | `.clone()` |
| `PartialEq` | `==` and `!=` |
| `Copy` | implicit copies, for small simple types |

## Enums

An **enum** is a type whose value is one of several **variants**. In Rust each variant can carry its own data:

```rust
enum Shape {
    Circle { radius: f64 },
    Rect { width: f64, height: f64 },
    Point,
}

let s = Shape::Circle { radius: 1.0 };
```

This is the tool for "it is one of these, and each case has different information". In other languages you would use a class hierarchy, or a struct full of fields that are sometimes meaningless.

## match

`match` looks at a value and runs the arm that fits:

```rust
fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius } => 3.14159 * radius * radius,
        Shape::Rect { width, height } => width * height,
        Shape::Point => 0.0,
    }
}
```

`match` must be **exhaustive**: every variant is handled, or the code does not compile. Add a variant to the enum next month, and the compiler lists every `match` you need to update. This is one of Rust's best features.

`_` matches anything, for the cases you do not care about:

```rust
match n {
    0 => println!("zero"),
    1 | 2 => println!("small"),
    3..=9 => println!("medium"),
    _ => println!("large"),
}
```

`match` is an expression, so its result can be assigned or returned.

## if let

When only one variant matters:

```rust
if let Shape::Circle { radius } = shape {
    println!("a circle of radius {}", radius);
}
```

## Make invalid states impossible

Compare two designs for a network connection:

```rust
struct Connection {             // weak: what does connected=false with an address mean?
    connected: bool,
    address: Option<String>,
    error: Option<String>,
}

enum Connection {               // strong: only real states exist
    Disconnected,
    Connected { address: String },
    Failed { error: String },
}
```

With the enum, "connected with an error and no address" cannot be written. Whole categories of bugs disappear before the program runs.

## Tuples

A quick group of values without names:

```rust
let pair: (i32, &str) = (1, "one");
let (number, word) = pair;          // take it apart
println!("{}", pair.0);
```

## Common mistakes

- **Forgetting `&self`** and writing a method that consumes its value.
- **A catch-all `_` arm on your own enum.** It hides new variants from the compiler's check.
- **Boolean flags and optional fields** where an enum would say exactly what the states are.
- **Forgetting `#[derive(Debug)]`** and being unable to print a value while debugging.
