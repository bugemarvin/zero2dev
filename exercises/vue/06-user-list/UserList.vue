<script setup>
import { ref, onMounted } from "vue";
import { useToggle } from "./useToggle.js";

const props = defineProps({
  load: { type: Function, required: true },
});

const users = ref([]);
</script>

<template>
  <div class="card">
    <p class="loading">Loading ...</p>
  </div>
</template>
