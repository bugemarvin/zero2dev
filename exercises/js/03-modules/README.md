# A cart module

Write the module `cart.mjs`. A cart is an array of items such as `{ id: 1, name: "Pen", price: 2.5 }`.

Named exports:

- `TAX_RATE`, the constant `0.2`.
- `addItem(cart, item)` returns a **new** array with the item added at the end.
- `removeItem(cart, id)` returns a new array without the item that has that id.
- `total(cart)` returns the sum of the prices plus tax, rounded to 2 decimals. An empty cart costs `0`.

Default export:

- a function `summary(cart)` that returns text such as `2 items, total 6.60`. Use `1 item` for a single item. The total always has two decimals.

The functions must not change the cart they are given. A helper that rounds does not need to be exported.
