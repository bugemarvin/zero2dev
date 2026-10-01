---
title: Lifecycle, data and composables
summary: Run code when a component appears, load data from a server, and share logic between components.
---

## Lifecycle hooks

A component is created, put on the page (**mounted**), updated, and removed (**unmounted**). You can run code at those moments:

```javascript
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  console.log("the component is on the page");
});

onUnmounted(() => {
  console.log("the component is gone");
});
```

Whatever you start in `onMounted`, stop in `onUnmounted`: timers, event listeners, subscriptions.

```javascript
let timer;
onMounted(() => { timer = setInterval(tick, 1000); });
onUnmounted(() => { clearInterval(timer); });
```

## Loading data

Data from a server has three states, and the page should show each of them:

```html
<script setup>
import { ref, onMounted } from "vue";

const users = ref([]);
const loading = ref(true);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch("/api/users");
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    users.value = await response.json();
  } catch (problem) {
    error.value = problem.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <p v-if="loading">Loading ...</p>
  <p v-else-if="error" role="alert">{{ error }}</p>
  <ul v-else>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

- `fetch` does not fail on a 404 or a 500: check `response.ok`.
- `finally` runs in both cases, so `loading` always ends up `false`.

## watch: load again when something changes

```javascript
const props = defineProps({ userId: Number });

watch(() => props.userId, load, { immediate: true });
```

The first argument says what to watch. `immediate: true` also runs it once at the start.

## Composables

When two components need the same logic, move it into a function. A function that uses Vue's reactivity is called a **composable**, and by convention its name starts with `use`:

```javascript
// useToggle.js
import { ref } from "vue";

export function useToggle(initial = false) {
  const on = ref(initial);

  function toggle() {
    on.value = !on.value;
  }

  return { on, toggle };
}
```

```html
<script setup>
import { useToggle } from "./useToggle.js";

const { on: isOpen, toggle } = useToggle();
</script>

<template>
  <button @click="toggle">{{ isOpen ? "Close" : "Open" }}</button>
</template>
```

Each call creates its own state: two components that call `useToggle()` do not share anything. A composable shares **logic**, not data.

The loading code above is a natural composable:

```javascript
export function useFetch(url) {
  const data = ref(null);
  const loading = ref(true);
  const error = ref("");
  // ... the same load function ...
  return { data, loading, error, reload: load };
}
```

Composables can use lifecycle hooks, `watch`, `computed` and other composables. They are ordinary JavaScript, which makes them easy to test.

## The rest of the ecosystem

| Need | Tool |
| --- | --- |
| several pages with their own addresses | **Vue Router** |
| state shared across the whole application | **Pinia** |
| a full framework with server rendering and file-based routes | **Nuxt** |
| tests | **Vitest** and **Vue Test Utils**, which check the exercises of this track |

## Common mistakes

- **No loading and no error state**, so the page is blank while waiting and blank when it fails.
- **Not checking `response.ok`.**
- **Timers and listeners that are never removed.**
- **A composable that keeps its `ref` outside the function**, which makes every component share one state by accident.
- **Reaching for a store** for data that one component owns.
