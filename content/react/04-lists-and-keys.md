---
title: Lists and keys
summary: Turn an array into elements, and tell React which item is which.
---

## Rendering a list

There is no loop syntax in JSX. Use `map` to turn an array of data into an array of elements:

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Filter first if only some should show:

```jsx
{todos.filter((todo) => !todo.done).map((todo) => (
  <li key={todo.id}>{todo.title}</li>
))}
```

## Keys

Every element produced by `map` needs a `key`: a value that identifies that item among its siblings and stays the same between renders.

When the list changes, React uses the keys to work out what happened: which items are new, which were removed, which moved. With good keys it updates only what changed, and each item keeps its own state.

| Key | Verdict |
| --- | --- |
| an id from your data: `todo.id` | correct |
| the array index | only for a list that never reorders, grows at the front, or loses items |
| `Math.random()` | wrong: a new key every render destroys and rebuilds each item |

With the index as key, deleting the first item makes every remaining item take over the key of the one before it. React then keeps the wrong state with the wrong row, for example the text typed into an input.

The key goes on the outermost element returned from `map`. It is not passed to the component as a prop.

## An empty list

Decide what to show when there is nothing:

```jsx
function TodoList({ todos }) {
  if (todos.length === 0) {
    return <p>Nothing to do.</p>;
  }
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

## A component per item

When an item has behaviour of its own, give it a component:

```jsx
function TodoItem({ todo, onToggle, onRemove }) {
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        {todo.title}
      </label>
      <button onClick={() => onRemove(todo.id)}>Remove</button>
    </li>
  );
}
```

The list keeps the data and passes down functions:

```jsx
function Todos() {
  const [todos, setTodos] = useState([
    { id: 1, title: "Learn React", done: false },
    { id: 2, title: "Build something", done: false },
  ]);

  function toggle(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={toggle} onRemove={remove} />
      ))}
    </ul>
  );
}
```

The item knows how to display one todo and report clicks. The list owns the array and decides how it changes. Data goes down, events come up.

## Events in a list

Each item needs to say **which** one was clicked. An arrow function captures the id:

```jsx
<button onClick={() => onRemove(todo.id)}>Remove</button>
```

## Common mistakes

- **No key**, or a warning about it in the console that gets ignored.
- **The index as key** on a list that changes.
- **`key` placed on an inner element** and not on the one returned from `map`.
- **Braces and no return in the arrow function**: `todos.map((t) => { <li>...</li> })` returns nothing. Use round brackets, or write `return`.
- **Mutating the array** with `push` or `splice` before setting state.
