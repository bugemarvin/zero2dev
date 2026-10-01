---
title: Vectors, hash maps and strings
summary: The collections of the standard library, and why Rust has two string types.
---

## Vec

A `Vec<T>` is a growable list:

```rust
let mut numbers: Vec<i32> = Vec::new();
numbers.push(10);
numbers.push(20);

let primes = vec![2, 3, 5, 7];          // the vec! macro

println!("{}", primes[0]);              // panics if the index does not exist
println!("{:?}", primes.get(10));       // None: the safe way
println!("{}", primes.len());
```

Looping:

```rust
for n in &primes {              // borrow each element
    println!("{}", n);
}
for n in &mut numbers {         // change each element
    *n += 1;
}
for n in primes {               // takes the vector: it is gone afterwards
}
```

Useful methods: `pop()`, `contains(&x)`, `is_empty()`, `sort()`, `reverse()`, `iter().sum()`, `iter().max()`.

## String and &str

| Type | What it is | Like |
| --- | --- | --- |
| `String` | text you **own**, on the heap, growable | `Vec<u8>` |
| `&str` | a **borrowed** view of text someone else owns | `&[u8]` |

A literal such as `"hello"` is a `&str`, stored in the program itself.

```rust
let mut s = String::from("hello");
s.push_str(", world");
s.push('!');

let view: &str = &s;                    // borrow a String as &str
let owned: String = view.to_string();   // make an owned copy

let joined = format!("{}-{}", "a", "b");
```

Take `&str` as a parameter, return `String` when you create new text.

Rust strings are UTF-8, and a character can take one to four bytes. So there is no `s[0]`:

```rust
let word = "héllo";
println!("{}", word.len());                 // 6 bytes
println!("{}", word.chars().count());       // 5 characters
let first = word.chars().next();            // Some('h')
```

Handy methods: `trim()`, `to_lowercase()`, `to_uppercase()`, `contains("x")`, `starts_with("x")`, `replace("a", "b")`, `split(',')`, `split_whitespace()`, `lines()`, `parse::<i32>()`.

## HashMap

```rust
use std::collections::HashMap;

let mut ages: HashMap<String, u32> = HashMap::new();
ages.insert(String::from("sam"), 30);

match ages.get("sam") {             // get returns an Option
    Some(age) => println!("{}", age),
    None => println!("unknown"),
}

ages.remove("sam");
```

The **entry API** handles "update it, or insert it if missing" in one step:

```rust
let mut counts: HashMap<String, u32> = HashMap::new();
for word in text.split_whitespace() {
    *counts.entry(word.to_string()).or_insert(0) += 1;
}
```

A `HashMap` has no order. For keys in sorted order use a `BTreeMap`, which has the same methods:

```rust
use std::collections::BTreeMap;

let mut counts: BTreeMap<String, u32> = BTreeMap::new();
// ... fill it the same way ...
for (word, count) in &counts {
    println!("{} {}", word, count);     // sorted by key
}
```

Or collect the entries into a vector and sort it:

```rust
let mut entries: Vec<(&String, &u32)> = counts.iter().collect();
entries.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));     // by count, highest first, then by word
```

## HashSet

A set of unique values: `insert`, `contains`, `len`.

```rust
use std::collections::HashSet;

let unique: HashSet<&str> = "a b a c b".split_whitespace().collect();
println!("{}", unique.len());       // 3
```

## Reading input

```rust
use std::io::Read;

let mut input = String::new();
std::io::stdin().read_to_string(&mut input).unwrap();
for line in input.lines() {
    // ...
}
```

## Common mistakes

- **Indexing a string**: `s[0]` does not compile. Use `chars()`.
- **`v[i]` with an index that may not exist.** Use `v.get(i)`.
- **Taking `String` parameters** when `&str` would do, forcing callers to clone.
- **Expecting a `HashMap` to keep order.**
- **Changing a vector while looping over it.** The borrow checker stops you. Collect the changes first.
