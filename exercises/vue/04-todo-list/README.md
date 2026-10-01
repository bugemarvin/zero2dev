# A todo list

Write `TodoList.vue`. It receives a prop `todos`: an array of objects such as `{ id: 1, title: "Buy milk", done: false }`.

- When the array is empty, show a paragraph with the class `empty` and the text `Nothing to do.`, and no list.
- Otherwise show a `ul` with one `li` per todo, showing its `title`. A todo that is done has the class `done`.
- A paragraph with the class `summary` shows `N of M done`, for example `1 of 3 done`. It is shown only when the list is not empty. Use `computed`.
- A button toggles whether done todos are shown. It reads `Hide done` at first. After a click the done todos are no longer in the list and the button reads `Show done`. The summary keeps counting all todos.
- Each `li` contains a button `Delete` that emits the event `remove` with the todo's `id`.

Give each `li` a `:key`.

Run the tests to check your component. **Start app** opens it in a browser tab, and the page reloads when you save.
