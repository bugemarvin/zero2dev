# Borrow, do not take

Write four functions in `solution.rs`. Each is `pub`. The signatures are given: fill in the bodies.

- `longest<'a>(a: &'a str, b: &'a str) -> &'a str` returns the longer of two texts, and `a` when they have the same length.
- `total(numbers: &[i32]) -> i32` returns the sum. It only reads the slice.
- `double_all(numbers: &mut Vec<i32>)` doubles every number **in place**.
- `append_exclamation(text: &mut String)` adds one `!` to the end of the text.

The `'a` in `longest` is a **lifetime**: it tells the compiler that the result lives as long as the two inputs. You only need to write the body.
