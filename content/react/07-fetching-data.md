---
title: Fetching data
summary: Load data from a server, and handle the three states every request has.
---

## Three states

A request is not instant, and it can fail. A component that loads data is therefore always in one of three situations, and should show something sensible in each:

| State | Show |
| --- | --- |
| loading | a "Loading" message or a spinner |
| error | what went wrong, ideally with a way to retry |
| success | the data, or a message when there is none |

Beginners write the last one and forget the first two.

## Fetching in an effect

```jsx
import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error(`request failed: ${response.status}`);
        }
        const data = await response.json();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p role="alert">Could not load users: {error}</p>;
  }
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

Things to notice:

- The effect function itself is not `async`. It defines an async function and calls it.
- `response.ok` is checked. `fetch` does not reject on a 404 or a 500.
- The `cancelled` flag is set by the cleanup. If the component goes away, or the effect re-runs, before the response arrives, the late answer is ignored.

## Requests that depend on a prop

Put the prop in the dependency array. The effect re-runs when it changes, and the cleanup discards the answer to the previous request:

```jsx
useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetch(`/api/users/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    });
  return () => {
    cancelled = true;
  };
}, [userId]);
```

Without the flag, a slow response for user 1 could arrive after the response for user 2 and overwrite it. That is a **race condition**.

## Sending data

Changes happen in event handlers, not in effects:

```jsx
async function handleAdd(title) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const created = await response.json();
  setTodos((previous) => [...previous, created]);
}
```

While a request is in flight, disable the button so that it cannot be sent twice.

## In real projects

Fetching by hand in an effect is worth learning, because it shows what is involved. For a real application, a data library such as TanStack Query or SWR handles caching, retries, refetching and race conditions for you. Frameworks such as Next.js go further and load data on the server before the page is sent.

## Testing components that fetch

Tests must not call a real server. They replace `fetch` with a fake that returns prepared data:

```jsx
globalThis.fetch = vi.fn(async () => ({
  ok: true,
  json: async () => [{ id: 1, name: "Ada" }],
}));
```

The test then renders the component, waits for the name to appear, and checks it. The exercise for this lesson works that way.

## Common mistakes

- **No loading state**, so the page flashes "No users" before the data arrives.
- **No error state**, so a failed request looks like an empty list.
- **Not checking `response.ok`.**
- **Setting state after the component is gone**, or from an outdated request.
- **Fetching in the body of the component**, outside an effect: a new request on every render, each of which triggers another render.
