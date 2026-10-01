<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 5 },
});

const emit = defineEmits(["rate"]);
</script>

<template>
  <div class="rating">
    <span class="label"><slot>Rating</slot></span>
    <button
      v-for="n in max"
      :key="n"
      class="star"
      :class="{ active: n <= value }"
      :aria-label="n === 1 ? '1 star' : n + ' stars'"
      @click="emit('rate', n)"
    >★</button>
  </div>
</template>
