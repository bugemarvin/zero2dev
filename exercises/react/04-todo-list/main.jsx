// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createRoot } from "react-dom/client";
import TodoList from "./TodoList.jsx";

const todos = [
  { id: 1, title: "Learn React", done: true },
  { id: 2, title: "Build something", done: false },
  { id: 3, title: "Ship it", done: false },
];

createRoot(document.getElementById("root")).render(<TodoList initialTodos={todos} />);
