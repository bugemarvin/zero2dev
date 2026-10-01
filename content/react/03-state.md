---
title: State
summary: Data that a component remembers and that makes the screen update when it changes.
---

## Why ordinary variables are not enough

```jsx
function Counter() {
  let count = 0;
  return <button onClick={() => { count += 1; }}>Clicked {count} times</button>;
}
```

Clicking changes `count`, and the screen stays at 0. Two things are missing. React does not know anything changed, so it does not run the component again. And if it did, `let count = 0` would start from zero again.

## useState

`useState` gives a component a value that **survives between renders**, and a function that changes it **and asks React to render again**.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

- `useState(0)` returns a pair: the current value, and a setter. `0` is the starting value, used on the first render only.
- Calling `setCount(...)` stores the new value and schedules a re-render.
- On that render, `useState` returns the new value.

Functions whose names start with `use` are **hooks**. Call them only at the top level of a component, never inside an `if`, a loop or a nested function. React matches hooks to their stored values by the order of the calls.

## Each render is a snapshot

Within one run of the component, `count` is a constant. Setting state does not change the variable you are holding. It affects the **next** render.

```jsx
function handleClick() {
  setCount(count + 1);
  console.log(count);      // still the old value
}
```

This also means three calls in a row do less than you might expect:

```jsx
setCount(count + 1);
setCount(count + 1);
setCount(count + 1);       // all three say "set it to old + 1"
```

When the new value depends on the previous one, pass a **function**. React gives it the latest value:

```jsx
setCount((previous) => previous + 1);
setCount((previous) => previous + 1);
setCount((previous) => previous + 1);       // adds 3
```

## Several pieces of state

Call `useState` once per independent value:

```jsx
const [name, setName] = useState("");
const [age, setAge] = useState(18);
const [open, setOpen] = useState(false);
```

## Objects and arrays: replace, never mutate

React decides whether to re-render by checking whether the value is a **different object**. Changing an object in place leaves it the same object, and nothing happens.

```jsx
const [user, setUser] = useState({ name: "Ada", age: 36 });

user.age = 37;                          // wrong: mutation, no re-render
setUser({ ...user, age: 37 });          // right: a new object
```

```jsx
const [items, setItems] = useState([]);

setItems([...items, newItem]);                              // add
setItems(items.filter((item) => item.id !== id));           // remove
setItems(items.map((item) =>
  item.id === id ? { ...item, done: !item.done } : item));  // change one
```

`push`, `splice` and `sort` change the array in place. Use spread, `filter` and `map`, which return new arrays.

## State is private to each copy

Use a component twice and each copy has its own state:

```jsx
<Counter />
<Counter />
```

## Do not store what you can calculate

If a value can be computed from props or other state, compute it during rendering:

```jsx
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);     // not state
const isEmpty = items.length === 0;                                  // not state
```

Storing derived values in state creates two things to keep in step, and they will drift apart.

## Common mistakes

- **Assigning to the state variable** in place of calling the setter.
- **Mutating an object or array** held in state.
- **Reading state right after setting it** and expecting the new value.
- **Calling a hook conditionally.**
- **`onClick={setCount(count + 1)}`**, which calls the setter during rendering and loops for ever. Wrap it: `onClick={() => setCount(count + 1)}`.
