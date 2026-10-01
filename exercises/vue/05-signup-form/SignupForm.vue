<script setup>
import { ref, computed } from "vue";

const name = ref("");
const email = ref("");
const plan = ref("free");
const terms = ref(false);

function send() {
  // check, then emit
}
</script>

<template>
  <form class="card" @submit.prevent="send">
    <p>
      <label for="name">Name</label>
      <input id="name" v-model.trim="name">
    </p>

    <button type="submit">Create account</button>
  </form>
</template>
