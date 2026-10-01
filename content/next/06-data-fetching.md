---
title: Loading data
summary: Fetch in server components, show progress and errors, and decide how fresh the data must be.
---

## Fetch where you render

A server component is `async`, so it simply awaits its data:

```jsx
// app/users/page.js
export default async function UsersPage() {
  const response = await fetch("https://api.example.com/users");
  if (!response.ok) {
    throw new Error(`could not load users: ${response.status}`);
  }
  const users = await response.json();

  if (users.length === 0) {
    return <p>No users yet.</p>;
  }
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Compare this with the [React version](react/07-fetching-data): no `useEffect`, no loading and error state variables, no race conditions. The component runs once per request on the server, and the browser gets the finished HTML.

It can equally read a database or a file. The code never reaches the browser, so credentials are safe.

## loading.js

While an async page is working, Next.js can show a placeholder at once and swap in the real content when it is ready. Add a `loading.js` next to the page:

```jsx
// app/users/loading.js
export default function Loading() {
  return <p>Loading users...</p>;
}
```

The layout and navigation appear immediately, and only the slow part waits. This is called **streaming**.

For finer control, wrap just the slow component in `Suspense`:

```jsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading orders...</p>}>
        <RecentOrders />
      </Suspense>
    </main>
  );
}
```

## error.js

When a page throws, the nearest `error.js` is shown in its place. It must be a client component, and it receives the error and a function to try again:

```jsx
// app/users/error.js
"use client";

export default function Error({ error, reset }) {
  return (
    <div role="alert">
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

So the three states from the React lesson are still there, expressed as three files: `loading.js`, `error.js`, and the page itself for success.

## In parallel

Awaiting one request after another makes the second wait for the first. Start independent requests together:

```jsx
const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);
```

## How fresh is the data?

A page can be rendered at different moments:

| Strategy | Rendered | Good for |
| --- | --- | --- |
| static | once, when the site is built | pages that are the same for everyone and rarely change |
| revalidated | at most once per time period | content that may be a little out of date: a blog, a catalogue |
| dynamic | on every request | personal or fast-changing data |

By default a `fetch` in a server component is **not cached**: it runs on every request. To allow reuse for a period:

```javascript
const response = await fetch(url, { next: { revalidate: 60 } });     // reuse for up to 60 seconds
```

After a change, a server action can mark a path as outdated, so that the next visit renders it afresh:

```javascript
import { revalidatePath } from "next/cache";

revalidatePath("/users");
```

Caching is the part of Next.js that changes most between versions. When in doubt, read the documentation for the version in your `package.json`, and measure.

## Configuration through the environment

Addresses and keys differ between your machine and the server. Read them from environment variables, and never hard-code them:

```javascript
const API_URL = process.env.API_URL ?? "http://localhost:4000";
```

During development they go in `.env.local`, which is not committed to Git.

## Testing a server component

A server component is an async function that returns JSX. A test can call it, wait for the result, and render that to HTML:

```jsx
import { renderToStaticMarkup } from "react-dom/server";

globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 1, name: "Ada" }] }));
const html = renderToStaticMarkup(await UsersPage());
expect(html).toContain("Ada");
```

The exercise for this lesson is checked that way, so it needs no server.

## Common mistakes

- **`useEffect` and `fetch` in a client component** for data the page could load on the server.
- **Not checking `response.ok`.**
- **Awaiting independent requests one by one.**
- **Catching an error and rendering nothing.** Throw, and let `error.js` handle it.
- **Assuming data is cached**, or that it is not. Check for your version.
