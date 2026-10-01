---
title: Iterators, closures and tests
summary: Process data in pipelines, and test your code with the tools built into cargo.
---

## Closures

A **closure** is a function written in place, which can use the variables around it:

```rust
let limit = 10;
let is_small = |n: i32| n < limit;      // captures limit
println!("{}", is_small(3));

let add = |a, b| a + b;                 // types are worked out
```

## Iterators

An iterator produces values one at a time. Collections give you one with `.iter()`:

```rust
let numbers = vec![1, 2, 3, 4, 5, 6];

let result: Vec<i32> = numbers
    .iter()
    .filter(|n| *n % 2 == 0)        // keep the even ones
    .map(|n| n * n)                 // square them
    .collect();                     // gather into a Vec: [4, 16, 36]
```

Read it top to bottom as a pipeline. Each step is an **adapter** that returns a new iterator.

| Adapter | Does |
| --- | --- |
| `map(f)` | transforms each item |
| `filter(f)` | keeps items for which `f` is true |
| `enumerate()` | pairs each item with its index |
| `zip(other)` | pairs items of two iterators |
| `take(n)`, `skip(n)` | the first n, or all but the first n |
| `rev()` | backwards |
| `chain(other)` | one after the other |

Iterators are **lazy**: nothing happens until a **consumer** asks for values.

| Consumer | Gives |
| --- | --- |
| `collect()` | a collection |
| `sum()`, `product()`, `count()` | a number |
| `min()`, `max()` | an `Option` |
| `any(f)`, `all(f)` | a `bool` |
| `find(f)` | the first match, as an `Option` |
| `fold(start, f)` | anything: the general form |
| `for x in iter` | runs your code for each item |

```rust
let total: i32 = numbers.iter().sum();
let has_big = numbers.iter().any(|&n| n > 5);
let first_even = numbers.iter().find(|&&n| n % 2 == 0);
let product = numbers.iter().fold(1, |acc, n| acc * n);
```

`collect` can build many things. The type you ask for decides:

```rust
let words: Vec<&str> = "a b c".split(' ').collect();
let text: String = vec!["a", "b"].concat();
let lengths: std::collections::HashMap<&str, usize> = words.iter().map(|w| (*w, w.len())).collect();
```

A chain of adapters compiles to the same machine code as a hand-written loop. Use whichever reads better.

## iter, iter_mut, into_iter

| Call | Items are | The collection afterwards |
| --- | --- | --- |
| `v.iter()` | `&T` | still usable |
| `v.iter_mut()` | `&mut T` | still usable, changed |
| `v.into_iter()` | `T` | consumed |

## Modules

```rust
mod geometry {
    pub fn area(w: f64, h: f64) -> f64 {
        w * h
    }
}

use geometry::area;
```

Everything is private unless marked `pub`. In a cargo project, `mod geometry;` loads the file `src/geometry.rs`.

## Testing

Tests live in the same file as the code, in a module compiled only for testing:

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    #[should_panic]
    fn index_out_of_range_panics() {
        let v: Vec<i32> = vec![];
        let _ = v[0];
    }
}
```

```console
$ cargo test
$ cargo test adds          # only tests whose name contains "adds"
```

`assert_eq!`, `assert_ne!` and `assert!` are the three you need. A test may also return a `Result` and use `?`.

## Dependencies

Libraries are called **crates** and come from crates.io:

```console
$ cargo add serde --features derive
$ cargo add rand
```

That records them in `Cargo.toml`. `Cargo.lock` pins the exact versions, and belongs in Git for applications.

## Common mistakes

- **Forgetting `collect()`** and wondering why nothing happened. The compiler warns about an unused iterator.
- **Double references in closures** such as `|&&n|`. `filter` receives a reference to the item, which is itself a reference when you used `.iter()`. Let the compiler's hint guide you.
- **A very long chain** where a plain `for` loop with a clear name would be easier to read.
- **Tests that only check that the code runs**, with no assertion.
