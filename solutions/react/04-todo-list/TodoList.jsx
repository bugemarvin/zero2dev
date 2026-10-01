import { useState } from "react";

export default function TodoList({ initialTodos = [] }) {
  const [todos, setTodos] = useState(initialTodos);

  function toggle(id) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }

  function remove(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  if (todos.length === 0) {
    return <p>Nothing to do.</p>;
  }

  const left = todos.filter((todo) => !todo.done).length;

  return (
    <div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
              {todo.title}
            </label>
            <button aria-label={`Remove ${todo.title}`} onClick={() => remove(todo.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>{left} left</p>
    </div>
  );
}
