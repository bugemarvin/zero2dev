<script setup>
import { ref, computed } from "vue";

const count = ref(0);
</script>

<template>
  <div class="card">
    <p class="count">Count: {{ count }}</p>
  </div>
</template>
