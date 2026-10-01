---
title: Ownership and borrowing
summary: The one idea that makes Rust different, and safe.
---

## The three rules

1. Every value has exactly one **owner**: a variable.
2. When the owner goes out of scope, the value is **dropped**: its memory is freed.
3. Ownership can **move** to another variable. The old one can then no longer be used.

There is no garbage collector and no `free`. The compiler knows, from these rules alone, exactly where each value dies.

## Moves

```rust
let a = String::from("hello");
let b = a;                  // the String moves from a to b
println!("{}", a);          // error: borrow of moved value: `a`
```

A `String` owns memory on the heap. If both `a` and `b` owned it, both would free it. So the assignment **moves** it, and `a` is dead.

Passing a value to a function moves it too:

```rust
fn consume(s: String) { }

let s = String::from("hi");
consume(s);
println!("{}", s);          // error: s was moved into the function
```

Simple values that live entirely on the stack are **copied** instead: integers, floats, `bool`, `char`. They implement the `Copy` trait.

```rust
let x = 5;
let y = x;                  // a copy: x is still usable
```

When you really want two independent values, say so: `let b = a.clone();`.

## Borrowing

Moving everything would be painful. Usually a function only needs to **look** at a value. A **reference** borrows it without taking ownership:

```rust
fn length(s: &String) -> usize {
    s.len()
}

let s = String::from("hello");
let n = length(&s);         // lend it
println!("{} {}", s, n);    // still ours
```

`&s` creates a reference. The function borrows, and gives it back when it returns.

## Mutable borrows

A plain reference is read-only. To let a function change the value, lend it **mutably**:

```rust
fn shout(s: &mut String) {
    s.push_str("!");
}

let mut s = String::from("hello");
shout(&mut s);
```

## The borrowing rule

At any moment, a value can have:

- **any number of readers** (`&T`), **or**
- **exactly one writer** (`&mut T`),

and never both.

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];          // a reader
v.push(4);                  // error: a writer, while a reader exists
println!("{}", first);
```

This is the rule that looks harsh and saves you. `push` may move the vector's contents to a bigger block of memory, which would leave `first` pointing at freed memory. In C that is a crash waiting to happen. In Rust it does not compile. The same rule removes data races between threads.

## Slices: borrowing a part

```rust
let s = String::from("hello world");
let word: &str = &s[0..5];          // a view into s

let numbers = vec![1, 2, 3, 4];
let middle: &[i32] = &numbers[1..3];
```

Write function parameters as `&str` and `&[T]`, not `&String` and `&Vec<T>`. They accept more:

```rust
fn first_word(text: &str) -> &str {
    text.split_whitespace().next().unwrap_or("")
}

first_word("hello world");               // a literal
first_word(&String::from("hi there"));   // a String, borrowed
```

## References never dangle

```rust
fn broken() -> &String {
    let s = String::from("hi");
    &s                      // error: s is dropped here, the reference would point at nothing
}
```

Return the `String` itself. That moves ownership out to the caller.

## How to think about it

| You write | Meaning |
| --- | --- |
| `fn f(x: T)` | "I take this. You no longer have it." |
| `fn f(x: &T)` | "I only look." |
| `fn f(x: &mut T)` | "I will change yours." |

## Common mistakes

- **Using a value after moving it.** Borrow with `&`, or `clone()` if you need two.
- **Holding a reference into a collection while changing it.**
- **Sprinkling `.clone()` everywhere** to silence the compiler. It works, and costs speed. First ask whether a reference would do.
- **Returning a reference to a local variable.**
