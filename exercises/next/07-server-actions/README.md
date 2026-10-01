# Change data with server actions

`lib/todos.js` is given, with `listTodos()`, `addTodo(title)` and `deleteTodo(id)`.

## `app/actions.js`

Its first line is `"use server";`. It exports two async functions.

`createTodo(formData)`:

- reads the field `title` and trims it;
- if it is empty, returns `{ error: "A title is required." }` and adds nothing;
- if it is longer than 50 characters, returns `{ error: "A title can have at most 50 characters." }` and adds nothing;
- otherwise adds the todo, calls `revalidatePath("/todos")`, and returns `{ ok: true }`.

`removeTodo(id)`:

- deletes the todo with that id (a number), calls `revalidatePath("/todos")`, and returns `{ ok: true }`. For an unknown id it returns `{ error: "No such todo." }` and does not revalidate.

## `app/todos/page.jsx`, a server component

- a `<form>` whose `action` is `createTodo`, with an `<input name="title" />` and a submit button `Add`;
- a `<ul>` with one `<li>` per todo from `listTodos()`, showing the title.

`revalidatePath` comes from `next/cache`. The tests replace it with a fake and check that you call it.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
