<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  todos: { type: Array, required: true },
});
</script>

<template>
  <div class="card">
    <p class="empty">Nothing to do.</p>
  </div>
</template>
