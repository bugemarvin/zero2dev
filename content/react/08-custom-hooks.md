---
title: Custom hooks
summary: Move stateful logic out of components into functions you can reuse and test.
---

## The problem

Two components need the same logic: a value that toggles, a form field, a subscription to the window size. Copying the `useState` and `useEffect` lines into both works until one copy gets fixed and the other does not.

## A custom hook

A **custom hook** is a function whose name starts with `use` and that calls other hooks. That is the whole definition.

```jsx
import { useState } from "react";

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);

  function toggle() {
    setOn((previous) => !previous);
  }

  return [on, toggle];
}
```

```jsx
function Menu() {
  const [open, toggleOpen] = useToggle();
  return (
    <>
      <button onClick={toggleOpen}>Menu</button>
      {open && <nav>...</nav>}
    </>
  );
}
```

Each component that calls `useToggle` gets its **own** state. A hook shares logic, not data.

The `use` prefix matters. It tells React, and the linter, that the rules of hooks apply: call it at the top level of a component or of another hook, never conditionally.

## What to return

Return whatever makes the hook pleasant to use:

| Shape | When |
| --- | --- |
| an array: `[value, setValue]` | one value and one action, like `useState`. The caller picks the names. |
| an object: `{ count, increment, reset }` | several values or actions |

```jsx
export function useCounter(start = 0, step = 1) {
  const [count, setCount] = useState(start);
  return {
    count,
    increment: () => setCount((c) => c + step),
    decrement: () => setCount((c) => c - step),
    reset: () => setCount(start),
  };
}
```

## Hooks with effects

A hook can hide an effect and its cleanup completely:

```jsx
import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
```

The component just reads a number: `const width = useWindowWidth();`

## State that survives a reload

`localStorage` keeps small pieces of text in the browser between visits. A hook can make it behave like state:

```jsx
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initial : JSON.parse(stored);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

Passing a **function** to `useState` makes React call it once, on the first render, to compute the starting value. Reading storage on every render would be wasted work.

## A hook for fetching

The loading, error and data handling from the last lesson, written once:

```jsx
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

```jsx
const { data, loading, error } = useFetch("/api/users");
```

## When to extract a hook

- The same stateful logic appears in two components.
- A component has become hard to read, and a chunk of its logic has a clear name.

Do not extract one just to make a component shorter. A hook used once, with a vague name, only moves the complexity to another file.

## Common mistakes

- **A name that does not start with `use`.** The linter cannot check the rules of hooks.
- **Expecting two components to share state** through a hook. Each call has its own.
- **Calling a hook inside a condition or loop.**
- **Returning new functions that callers put in dependency arrays**, causing effects to re-run every render.
