# Load data, with loading and error states

Write the three files of the `/users` route.

## `app/users/page.jsx`, an async server component

- It fetches `${process.env.API_URL}/users` and expects a JSON array of users such as `{ "id": 1, "name": "Ada" }`.
- If the response is not ok, it **throws** an `Error` whose message is `could not load users`.
- For an empty array it renders a `<p>` with `No users yet.`
- Otherwise it renders a `<ul>` with one `<li>` per user, showing the name.

## `app/users/loading.jsx`

Its default export renders a `<p>` with `Loading users...`

## `app/users/error.jsx`, a client component

- Its first line is `"use client";`
- It receives `{ error, reset }` and renders an element with `role="alert"` containing the text `Something went wrong.`, and a button `Try again` that calls `reset` when clicked.

The tests replace `fetch` with a fake, so no API server is needed.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
