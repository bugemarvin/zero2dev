<script setup>
import { ref, computed } from "vue";

const count = ref(0);
const double = computed(() => count.value * 2);
const parity = computed(() => (count.value % 2 === 0 ? "even" : "odd"));

function subtract() {
  if (count.value > 0) {
    count.value -= 1;
  }
}
</script>

<template>
  <div class="card">
    <p class="count">Count: {{ count }}</p>
    <p class="double">Double: {{ double }}</p>
    <p class="parity">{{ parity }}</p>
    <button @click="count++">Add</button>
    <button :disabled="count === 0" @click="subtract">Subtract</button>
    <button @click="count = 0">Reset</button>
  </div>
</template>
