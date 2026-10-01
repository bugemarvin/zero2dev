---
title: Rust basics
summary: Variables that do not change unless you say so, types, functions, and the tools.
---

## Why Rust

C gives you full control of memory and lets you corrupt it. Languages with a garbage collector keep you safe and pause your program to clean up. **Rust** gives you the speed and control of C, and its compiler **proves** that your program has no dangling pointers, no double frees and no data races. The price is a compiler that rejects programs other languages would accept. This track teaches you to work with it.

## The first program

```rust
fn main() {
    println!("Hello, Rust");
}
```

```console
$ rustc main.rs
$ ./main
Hello, Rust
```

`println!` ends in `!` because it is a **macro**, not a function. You will meet a few: `println!`, `format!`, `vec!`, `panic!`.

## cargo

Real projects use **cargo**, Rust's build tool and package manager:

```console
$ cargo new hello       # creates hello/Cargo.toml and hello/src/main.rs
$ cd hello
$ cargo run             # build and run
$ cargo build --release # optimised build, in target/release/
$ cargo test
$ cargo fmt             # the one official code style
$ cargo clippy          # advice on better ways to write it
```

The exercises of this track are single files, built with `rustc`, so you see exactly what happens.

## Variables are immutable by default

```rust
let x = 5;
x = 6;              // error: cannot assign twice to immutable variable

let mut y = 5;      // mut makes it changeable
y = 6;
```

You decide which values may change, and the compiler holds you to it. Most variables never need `mut`.

**Shadowing** declares a new variable with the same name. It is common when converting a value:

```rust
let input = "42";
let input: i32 = input.parse().unwrap();     // a new variable, of another type
```

## Types

| Type | Holds |
| --- | --- |
| `i32`, `i64` | signed whole numbers of 32 and 64 bits |
| `u8`, `u32`, `u64`, `usize` | unsigned ones. `usize` is the type of indexes and lengths. |
| `f64` | a number with a fraction |
| `bool` | `true` or `false` |
| `char` | one Unicode character, in single quotes: `'a'` |
| `&str` | a borrowed piece of text: `"hello"` |
| `String` | text you own and can grow |

The compiler works out most types. Rust never converts between number types by itself:

```rust
let n: i32 = 7;
let half = n as f64 / 2.0;      // 3.5
let whole = n / 2;              // 3
```

In a debug build, arithmetic that overflows stops the program, where C would silently wrap around.

## Functions

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b           // no semicolon: this expression is the return value
}
```

- Parameter and return types are always written.
- The **last expression** of a function, without a semicolon, is its result. `return` is for leaving early.

Add a semicolon to `a + b` and the function returns nothing. The compiler tells you exactly that.

## if is an expression

```rust
let size = if n > 100 { "big" } else { "small" };
```

Both branches must have the same type. There is no separate `? :` operator.

## Loops

```rust
for i in 0..5 {             // 0, 1, 2, 3, 4
    println!("{}", i);
}
for i in 1..=5 { }          // 1 to 5, including 5

while n > 0 {
    n -= 1;
}

loop {                      // forever, until break
    break;
}
```

## Printing

```rust
println!("{} is {} years old", name, age);
println!("{name} is {age} years old");      // variables straight in the braces
println!("{:.2}", 3.14159);                 // 3.14
println!("{:?}", vec![1, 2, 3]);            // debug form: [1, 2, 3]
```

## Read the error messages

Rust's compiler messages are the best in any language. They show the line, explain the rule, and usually suggest the fix. Read them from the top, slowly. Run `rustc --explain E0382` for a longer explanation of any error code.

## Common mistakes

- **Forgetting `mut`** on a variable you change.
- **A semicolon after the last expression** of a function that should return it.
- **Mixing number types** without `as`.
- **Fighting the compiler** by trying random changes. Read the message: it says what to do.
