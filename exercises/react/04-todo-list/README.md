# A list you can change

Complete `TodoList.jsx`.

`<TodoList initialTodos={todos} />`, where each todo looks like `{ id: 1, title: "Learn React", done: false }`.

- With no todos it shows a `<p>` with the text `Nothing to do.` and no list.
- Otherwise it shows a `<ul>` with one `<li>` per todo. Each item has:
    - a checkbox whose label is the todo's title, ticked when the todo is done. Clicking it switches `done`.
    - a button whose accessible name is `Remove TITLE`, for example `Remove Learn React` (use `aria-label`). It removes that todo.
- Below the list, a `<p>` shows how many are not done yet: `2 left`.

Keep the todos in state, starting from `initialTodos`. Use the todo's `id` as the key, and never change the array or its objects in place.

Run the tests to check your component. **Start app** opens it in a browser tab.
