# Write your own hooks

Write three hooks in `hooks.js` and export each by name.

- `useToggle(initial = false)` returns `[on, toggle]`. Calling `toggle()` flips the value.
- `useCounter(start = 0, step = 1)` returns an object `{ count, increment, decrement, reset }`. `increment` and `decrement` change the count by `step`, and `reset` goes back to `start`.
- `useLocalStorage(key, initial)` works like `useState`, returning `[value, setValue]`, and also keeps the value in `localStorage` under `key`, as JSON. On the first render it uses the stored value if there is one, and `initial` otherwise.

Calling `increment()` twice in a row must add two steps, so use the function form of the setter.

Run the tests to check your component. **Start app** opens it in a browser tab.
