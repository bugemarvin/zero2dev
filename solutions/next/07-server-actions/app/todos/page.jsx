import { createTodo } from "../actions.js";
import { listTodos } from "../../lib/todos.js";

export default function TodosPage() {
  return (
    <main>
      <form action={createTodo}>
        <label>
          Title <input name="title" />
        </label>
        <button type="submit">Add</button>
      </form>
      <ul>
        {listTodos().map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </main>
  );
}
