---
title: Sharing state
summary: Lift state up to a common parent, and use context for data that many components need.
---

## Lifting state up

Two components need the same data. Each having its own copy does not work: they would disagree.

The answer is to move the state to their **closest common parent**. The parent owns it and passes it down as props, along with functions to change it.

```jsx
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(20);

  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay celsius={celsius} />
    </>
  );
}

function CelsiusInput({ value, onChange }) {
  return (
    <label>
      Celsius
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function FahrenheitDisplay({ celsius }) {
  return <p>{(celsius * 9) / 5 + 32} °F</p>;
}
```

There is one source of truth. The input reports changes upward, and both children re-render with the new value.

A useful question for every piece of state: **which components need it?** Put it in the lowest component that contains all of them.

## Prop drilling

Sometimes a value is needed deep in the tree: the logged-in user, the colour theme, the language. Passing it through every level in between, including components that do not use it, is called **prop drilling**. It is tedious and makes each component in the chain depend on something it does not care about.

## Context

**Context** makes a value available to every component below a certain point, however deep, with nothing passed in between.

Three steps:

```jsx
import { createContext, useContext, useState } from "react";

// 1. create it
const ThemeContext = createContext(null);

// 2. provide a value to part of the tree
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  function toggleTheme() {
    setTheme((previous) => (previous === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. read it anywhere below
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return context;
}
```

```jsx
function App() {
  return (
    <ThemeProvider>
      <Toolbar />
    </ThemeProvider>
  );
}

function ThemeButton() {                    // any depth below the provider
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Theme: {theme}</button>;
}
```

Wrapping `useContext` in a small custom hook, as with `useTheme`, gives a clear error when a component is used outside its provider, and hides the context object from the rest of the code.

When the provider's value changes, every component that reads the context re-renders.

## When to use what

| Situation | Use |
| --- | --- |
| one component needs the data | state in that component |
| a few nearby components need it | lift it to their common parent |
| many components at many depths need it | context |
| a wrapper needs to show arbitrary content | the `children` prop |

Context is not a replacement for props. Props make it obvious what a component depends on. Reach for context when passing props has clearly become a burden, and for values that really are global to a part of the app.

For a large application with a lot of shared, frequently changing state, there are dedicated libraries such as Zustand and Redux. Most apps need far less of that than people expect.

## Composition before context

Often prop drilling disappears if you pass **components** down in place of data:

```jsx
// Layout does not need to know about the user at all
<Layout sidebar={<UserMenu user={user} />}>
  <Dashboard user={user} />
</Layout>
```

`Layout` receives finished elements and puts them in place.

## Where to go next

You now know the core of React: components, props, state, lists, forms, effects, data fetching, custom hooks and shared state. The natural next step is Next.js, which adds routing, server rendering and data loading on top of what you have learned here.

## Common mistakes

- **Duplicating state** in two components and trying to keep the copies in step.
- **Everything in context.** A change then re-renders the whole app, and components become hard to reuse.
- **Using a context hook outside its provider**, and getting `null`.
- **A new object as the provider value on every render**, with unrelated state in it.
- **Lifting state higher than needed.**
