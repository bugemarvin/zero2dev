// Shows your component in the browser (Start app). You may change it; the tests do not use it.
import { createApp, h, ref } from "vue";
import TodoList from "./TodoList.vue";

createApp({
  setup() {
    const todos = ref([
      { id: 1, title: "Buy milk", done: false },
      { id: 2, title: "Walk the dog", done: true },
      { id: 3, title: "Learn Vue", done: false },
    ]);
    return () => h(TodoList, {
      todos: todos.value,
      onRemove: (id) => { todos.value = todos.value.filter((todo) => todo.id !== id); },
    });
  },
}).mount("#app");
