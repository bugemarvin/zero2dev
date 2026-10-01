---
title: Effects
summary: Synchronise a component with something outside React, and clean up after it.
---

## What an effect is for

Rendering should only compute what the screen looks like. Some work has to reach **outside** React: starting a timer, changing the page title, opening a connection, subscribing to an event. That work goes in an **effect**, which runs after React has updated the screen.

```jsx
import { useEffect, useState } from "react";

function PageTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <h1>{title}</h1>;
}
```

`useEffect` takes a function and an array of **dependencies**.

## When it runs

| Dependencies | The effect runs |
| --- | --- |
| `[a, b]` | after the first render, and again whenever `a` or `b` has changed |
| `[]` | once, after the first render |
| left out | after every render (rarely what you want) |

List every value from the component that the effect uses: props, state, and anything computed from them. If you leave one out, the effect keeps using an old value. That is the most common effect bug.

## Cleaning up

An effect that starts something must stop it. Return a function, and React calls it before the effect runs again, and when the component is removed.

```jsx
function Clock() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);
    return () => clearInterval(id);        // stop the timer
  }, []);

  return <p>{seconds} seconds</p>;
}
```

Two details matter here.

**The cleanup.** Without `clearInterval`, the timer keeps running after the component has gone, and every re-run of the effect would start another.

**The updater function.** `setSeconds((previous) => previous + 1)` does not read `seconds` from the component, so `seconds` is not a dependency and the timer is set up once. Writing `setSeconds(seconds + 1)` with `[]` would freeze at 1: the effect would only ever see the first value.

The same shape applies to event listeners:

```jsx
useEffect(() => {
  function onResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
```

During development, React runs every effect twice on mount: run, clean up, run again. It does that on purpose, to reveal effects that are missing their cleanup.

## You may not need an effect

Effects are for synchronising with the outside world. Many things that look like a job for an effect are not.

**Deriving data.** Calculate it while rendering:

```jsx
// unnecessary
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(first + " " + last);
}, [first, last]);

// better
const fullName = first + " " + last;
```

**Responding to a click.** Do it in the event handler. An effect is for things that must happen **because the component is on screen**, not because the user did something.

## Reacting to a prop

When a dependency changes, the cleanup of the old effect runs first, then the new effect:

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = connect(roomId);
    return () => connection.close();
  }, [roomId]);

  return <h2>Room {roomId}</h2>;
}
```

Switching rooms closes the old connection and opens a new one, with no extra code.

## useRef

`useRef` holds a value that survives renders and does **not** cause one when it changes. Its two uses: reaching a DOM element, and remembering something like a timer id.

```jsx
import { useEffect, useRef } from "react";

function SearchBox() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

## Common mistakes

- **No cleanup** for a timer, listener or connection.
- **A missing dependency**, giving stale values.
- **No dependency array**, with an effect that sets state: an endless loop.
- **An effect to compute something** that could be calculated during rendering.
- **An `async` function passed straight to `useEffect`.** It would return a promise in place of a cleanup function. Define an async function inside the effect and call it.
