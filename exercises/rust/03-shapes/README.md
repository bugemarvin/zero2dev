# Shapes with an enum

Write the following in `solution.rs`. Everything is `pub`.

## `Shape`

An enum with three variants. Derive `Debug`, `Clone` and `PartialEq`.

- `Circle { radius: f64 }`
- `Rect { width: f64, height: f64 }`
- `Square(f64)`: the side

Methods:

- `area(&self) -> f64`. Use `std::f64::consts::PI` for the circle.
- `name(&self) -> &'static str` returns `"circle"`, `"rect"` or `"square"`.
- `scale(&mut self, factor: f64)` multiplies every length by the factor.

## `Counter`

A struct with a private field.

- `Counter::new() -> Counter` starts at 0.
- `increment(&mut self)` adds 1.
- `value(&self) -> u32` returns the count.
- `reset(&mut self)` goes back to 0.
