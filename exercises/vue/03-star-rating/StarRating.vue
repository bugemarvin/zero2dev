<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
});
</script>

<template>
  <div class="rating">
    <span class="label">Rating</span>
  </div>
</template>
