// Given. Do not edit.
const store = (globalThis.z2dTodos ??= { todos: [], nextId: 1 });

export function listTodos() {
  return store.todos;
}

export function addTodo(title) {
  const todo = { id: store.nextId++, title };
  store.todos.push(todo);
  return todo;
}

export function deleteTodo(id) {
  const before = store.todos.length;
  store.todos = store.todos.filter((todo) => todo.id !== id);
  return store.todos.length < before;
}

export function resetTodos() {
  store.todos = [];
  store.nextId = 1;
}
