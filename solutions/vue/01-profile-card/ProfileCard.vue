<script setup>
import { ref } from "vue";

const name = "Ada Lovelace";
const role = "Engineer";
const photo = "ada.jpg";
const site = "https://example.com/ada";

const following = ref(false);

function toggle() {
  following.value = !following.value;
}
</script>

<template>
  <div class="card">
    <h2>{{ name }}</h2>
    <p class="role">Role: {{ role }}</p>
    <img :src="photo" :alt="name">
    <a :href="site">Website</a>
    <button @click="toggle">{{ following ? "Following" : "Follow" }}</button>
  </div>
</template>
