# A trait and a generic function

Write the following in `solution.rs`. Everything is `pub`.

## `Priced`

A trait with:

- a required method `price(&self) -> f64`
- a required method `label(&self) -> String`
- a **default** method `receipt_line(&self) -> String` that returns the label, a colon, a space and the price with two decimals, for example `Coffee: 3.50`

## Two types that implement it

- `Product { name: String, unit_price: f64, quantity: u32 }`. Its price is the unit price times the quantity. Its label is `name xQUANTITY`, for example `Coffee x2`.
- `Service { name: String, hours: f64, rate: f64 }`. Its price is hours times rate. Its label is the name.

## Generic functions

- `total<T: Priced>(items: &[T]) -> f64` adds up the prices.
- `most_expensive(items: &[Box<dyn Priced>]) -> Option<String>` returns the label of the item with the highest price, or `None` for an empty list. This list can mix products and services.
- `largest<T: PartialOrd + Copy>(items: &[T]) -> Option<T>` returns the largest value of any comparable type, or `None`.
