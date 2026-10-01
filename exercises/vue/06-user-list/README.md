# Load data, and a composable

Two files to write.

## `useToggle.js`

Export a function `useToggle(initial)`. It returns an object with:

- `on`: a ref, starting at `initial`, or `false` when no argument is given;
- `toggle()`: switches `on` between `true` and `false`.

Every call has its own state.

## `UserList.vue`

It receives a prop `load`: an async function that returns an array of users such as `{ id: 1, name: "Ada" }`, or throws an error.

- When the component is mounted it calls `load()`.
- While waiting it shows a paragraph with the class `loading` and the text `Loading ...`.
- On success it shows a `ul` with one `li` per user, holding the name.
- On failure it shows a paragraph with `role="alert"` and the text `Could not load: ` followed by the error's message.
- A button `Reload` calls `load()` again, showing `Loading ...` while it waits. It is always visible.
- A second button uses your `useToggle`: it reads `Hide list`, and a click hides the `ul` and changes the button to `Show list`.

Run the tests to check your component. **Start app** opens it in a browser tab, and the page reloads when you save.
