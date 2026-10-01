<script setup>
import { ref, onMounted } from "vue";
import { useToggle } from "./useToggle.js";

const props = defineProps({
  load: { type: Function, required: true },
});

const users = ref([]);
const loading = ref(true);
const error = ref("");
const { on: visible, toggle } = useToggle(true);

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    users.value = await props.load();
  } catch (problem) {
    error.value = problem.message;
  } finally {
    loading.value = false;
  }
}

onMounted(refresh);
</script>

<template>
  <div class="card">
    <p v-if="loading" class="loading">Loading ...</p>
    <p v-else-if="error" role="alert">Could not load: {{ error }}</p>
    <ul v-else-if="visible">
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <button @click="refresh">Reload</button>
    <button @click="toggle">{{ visible ? "Hide list" : "Show list" }}</button>
  </div>
</template>
