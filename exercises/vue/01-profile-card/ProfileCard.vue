<script setup>
import { ref } from "vue";

const name = "Ada Lovelace";
const role = "Engineer";
const photo = "ada.jpg";
const site = "https://example.com/ada";

const following = ref(false);

function toggle() {
  // switch following between true and false
}
</script>

<template>
  <div class="card">
    <!-- write the template here -->
  </div>
</template>
