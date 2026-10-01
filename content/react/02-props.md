---
title: Props
summary: Pass data into components, show things conditionally, and wrap other content.
---

## Props are arguments

A component receives one argument: an object of the attributes it was given, called **props**.

```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

<Greeting name="Ada" />
```

Almost everyone destructures them in the parameter list, often with defaults:

```jsx
function Greeting({ name, punctuation = "!" }) {
  return <h1>Hello, {name}{punctuation}</h1>;
}
```

## Passing values

A string goes in quotes. Anything else goes in braces:

```jsx
<Badge label="New" />
<Avatar size={48} />
<UserCard user={currentUser} />
<Button disabled={true} onClick={handleClick} />
<Button disabled />              // a bare name means true
```

## Props are read-only

A component must never change its props. They belong to the parent. Given the same props, a component should return the same output. To change what is shown, the parent passes new props, or the component uses **state**, which is the next lesson.

## Showing things conditionally

JSX takes expressions, so use the conditional operator and `&&`:

```jsx
function UserCard({ user }) {
  return (
    <div className="card">
      <h2>{user.name}</h2>
      {user.admin && <span className="badge">Admin</span>}
      <p>{user.online ? "Online" : "Offline"}</p>
    </div>
  );
}
```

- `condition && <X />` shows `<X />` when the condition is true, and nothing otherwise.
- `condition ? <A /> : <B />` chooses between two.

`null`, `undefined`, `true` and `false` render nothing. Zero **does** render: `{count && <p>...</p>}` shows `0` when `count` is 0. Write `{count > 0 && ...}`.

For anything more involved, decide before the `return`:

```jsx
function Status({ state }) {
  if (state === "loading") {
    return <p>Loading...</p>;
  }
  if (state === "error") {
    return <p>Something went wrong.</p>;
  }
  return <p>Ready.</p>;
}
```

## children

Whatever is written between a component's opening and closing tags arrives as the prop `children`. This lets a component wrap any content:

```jsx
function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </section>
  );
}

<Card title="Welcome">
  <p>Any content can go here.</p>
  <button>OK</button>
</Card>
```

## Passing functions

A prop can be a function. That is how a child tells its parent that something happened:

```jsx
function DeleteButton({ onDelete }) {
  return <button onClick={onDelete}>Delete</button>;
}

<DeleteButton onDelete={() => removeItem(item.id)} />
```

Data flows **down** through props. Events flow **up** through functions passed as props. This one-way flow is what keeps a React app understandable as it grows.

## Spreading props

```jsx
const user = { name: "Ada", role: "Engineer" };
<UserCard {...user} />        // same as name="Ada" role="Engineer"
```

Handy, but it hides which props a component receives. Use it sparingly.

## Common mistakes

- **Changing a prop** inside the component.
- **Quotes around a number or an object**: `size="48"` passes a string.
- **`{count && <X />}`** printing a stray `0`.
- **Forgetting to render `{children}`**, so the wrapped content never shows.
- **Calling the function when passing it**: `onClick={remove()}` runs `remove` during rendering. Pass `onClick={remove}` or `onClick={() => remove(id)}`.
