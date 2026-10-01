# Arrays and objects

Write five exported functions in `solution.mjs`. Users look like `{ id: 1, name: "Ada", age: 36 }`.

- `total(prices)` returns the sum of an array of numbers. `0` for an empty array.
- `names(users)` returns an array of the users' names.
- `adults(users)` returns the users aged 18 or more, in the same order.
- `byId(users)` returns an object that maps each id to its user: `{ 1: {...}, 2: {...} }`.
- `withDefaults(options)` returns a new object with the defaults `theme: "light"`, `fontSize: 14` and `sidebar: true`, overridden by whatever `options` contains.

None of the functions may change the array or object it receives.
