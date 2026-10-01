---
title: Forms and server actions
summary: Change data with a function that runs on the server and is called straight from a form.
---

## Server actions

Reading data needs no API in Next.js. Changing it does not either. A **server action** is an async function that runs on the server and can be given to a form as its `action`.

```javascript
// app/actions.js
"use server";

import { revalidatePath } from "next/cache";
import { addTodo } from "../lib/todos.js";

export async function createTodo(formData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title === "") {
    return { error: "A title is required." };
  }
  addTodo(title);
  revalidatePath("/todos");
  return { ok: true };
}
```

`"use server"` at the top of the file marks every exported function in it as a server action.

```jsx
// app/todos/page.js
import { createTodo } from "../actions.js";
import { listTodos } from "../../lib/todos.js";

export default async function TodosPage() {
  const todos = listTodos();
  return (
    <main>
      <form action={createTodo}>
        <label>
          Title <input name="title" />
        </label>
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

When the form is submitted:

1. the browser sends the form fields to the server;
2. `createTodo` runs there, with a `FormData` object as its argument;
3. `revalidatePath("/todos")` marks the page as outdated;
4. the page is rendered again with the new todo, and the browser shows it.

No `fetch`, no route handler, no state for the list. The form even works before JavaScript has loaded.

## FormData

Each field is read by the `name` attribute of its input:

```javascript
formData.get("title")        // the value, as a string, or null if there is no such field
formData.getAll("tag")       // every value, for fields that repeat
```

Values are strings. Convert and validate them.

## Validate on the server

A server action is a public endpoint. Anyone can call it with any data, bypassing your form completely. So it must:

- **validate** every value: type, length, range;
- **check permission**: is this user allowed to do this?

Checks in the browser are a convenience for the user. The checks in the action are the ones that count.

## Showing the result

To display an error from the action, or to disable the button while it runs, the form needs a client component. `useActionState` connects the two:

```jsx
"use client";

import { useActionState } from "react";
import { createTodo } from "../actions.js";

export default function TodoForm() {
  const [state, formAction, pending] = useActionState(
    async (previous, formData) => createTodo(formData),
    null
  );

  return (
    <form action={formAction}>
      <label>
        Title <input name="title" />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

- `state` is whatever the action last returned.
- `pending` is true while it is running.

## After a change

| Function | From | Effect |
| --- | --- | --- |
| `revalidatePath("/todos")` | `next/cache` | the page is rendered again with fresh data |
| `redirect("/todos/5")` | `next/navigation` | send the user to another page |

`redirect` works by throwing a special error, so do not call it inside a `try` block that would catch it.

## Actions outside forms

A server action is an ordinary async function to the code that calls it. A client component can call one from an event handler:

```jsx
<button onClick={async () => { await removeTodo(todo.id); }}>Remove</button>
```

## Server action or route handler?

| Need | Use |
| --- | --- |
| your own pages change data | a server action |
| other programs call your app over HTTP | a [route handler](next/05-route-handlers) |

## Common mistakes

- **Forgetting `"use server"`.**
- **Trusting form data** because the form already checked it.
- **No `revalidatePath`**, so the page keeps showing old data.
- **An input with no `name`.** It is not part of the form data.
- **Returning something that cannot be sent to the browser**, such as a class instance.
