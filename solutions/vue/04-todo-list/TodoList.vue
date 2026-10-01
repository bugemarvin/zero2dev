<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  todos: { type: Array, required: true },
});

const emit = defineEmits(["remove"]);
const showDone = ref(true);

const visible = computed(() => (showDone.value ? props.todos : props.todos.filter((todo) => !todo.done)));
const doneCount = computed(() => props.todos.filter((todo) => todo.done).length);
</script>

<template>
  <div class="card">
    <p v-if="todos.length === 0" class="empty">Nothing to do.</p>
    <template v-else>
      <ul>
        <li v-for="todo in visible" :key="todo.id" :class="{ done: todo.done }">
          {{ todo.title }}
          <button @click="emit('remove', todo.id)">Delete</button>
        </li>
      </ul>
      <p class="summary">{{ doneCount }} of {{ todos.length }} done</p>
      <button class="toggle" @click="showDone = !showDone">{{ showDone ? "Hide done" : "Show done" }}</button>
    </template>
  </div>
</template>
