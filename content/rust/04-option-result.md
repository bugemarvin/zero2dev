---
title: Option, Result and error handling
summary: No null, no exceptions: absence and failure are ordinary values the compiler makes you handle.
---

## Option: a value that may be missing

Rust has no `null`. A value that may be absent has the type `Option<T>`:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

```rust
fn first_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

match first_even(&[1, 3, 4]) {
    Some(n) => println!("found {}", n),
    None => println!("no even number"),
}
```

An `Option<i32>` is not an `i32`. You cannot add to it or print it as a number until you have dealt with the `None` case. The "null pointer" crash of other languages cannot happen.

## Result: an operation that may fail

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

```rust
fn parse_age(text: &str) -> Result<u32, String> {
    match text.trim().parse::<u32>() {
        Ok(age) if age <= 150 => Ok(age),
        Ok(_) => Err(String::from("age out of range")),
        Err(_) => Err(format!("not a number: {}", text)),
    }
}
```

There are no exceptions. A function that can fail says so in its return type, and the caller must look.

## Getting the value out

| Method | Does |
| --- | --- |
| `match` | handles both cases explicitly |
| `if let Some(x) = opt` | handles one case |
| `.unwrap_or(default)` | the value, or a default |
| `.unwrap_or_else(\|\| ...)` | the value, or the result of a closure |
| `.map(\|x\| ...)` | changes the value inside, and leaves `None` or `Err` alone |
| `.ok_or(error)` | turns an `Option` into a `Result` |
| `.unwrap()` | the value, or **panic** |
| `.expect("message")` | the same, with your message |

`unwrap` is fine in examples, tests and quick scripts. In real code it is a crash waiting for unusual input.

## The ? operator

Passing errors up the call chain by hand is noisy. `?` does it in one character:

```rust
fn total_ages(a: &str, b: &str) -> Result<u32, String> {
    let first = parse_age(a)?;      // on Err, return that error from this function right now
    let second = parse_age(b)?;
    Ok(first + second)
}
```

`?` means: if this is `Ok`, give me the value; if it is `Err`, return it from the enclosing function. It works on `Option` too, returning `None`.

## Your own error type

A `String` error works for small programs. Real code uses an enum, so that callers can tell the cases apart:

```rust
#[derive(Debug, PartialEq)]
enum ConfigError {
    Missing(String),
    Invalid { key: String, value: String },
}

fn get_port(text: Option<&str>) -> Result<u16, ConfigError> {
    let text = text.ok_or(ConfigError::Missing(String::from("port")))?;
    text.parse().map_err(|_| ConfigError::Invalid {
        key: String::from("port"),
        value: text.to_string(),
    })
}
```

`map_err` converts one error type into another.

## main can return a Result

```rust
fn main() -> Result<(), String> {
    let age = parse_age("42")?;
    println!("{}", age);
    Ok(())
}
```

`()` is the empty value: "nothing, successfully".

## panic

`panic!("message")` stops the program. Like in Go, it is for bugs, not for expected failures:

| Situation | Use |
| --- | --- |
| a file is missing, input is wrong, the network fails | `Result` |
| a value may be absent | `Option` |
| "this cannot happen" | `panic!`, `unreachable!()` |

## Common mistakes

- **`unwrap()` on user input or files.**
- **Returning `-1` or an empty string** to mean "not found". Use `Option`.
- **Using `?` in a function that does not return `Result` or `Option`.**
- **Throwing away the error detail** with `.ok()` when the caller needs it.
