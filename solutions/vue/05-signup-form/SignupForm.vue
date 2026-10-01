<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["submit"]);

const name = ref("");
const email = ref("");
const plan = ref("free");
const terms = ref(false);
const tried = ref(false);
const welcomed = ref("");

const errors = computed(() => {
  const list = [];
  if (name.value === "") {
    list.push("Name is required");
  }
  if (!email.value.includes("@")) {
    list.push("Enter a valid email");
  }
  if (!terms.value) {
    list.push("Accept the terms");
  }
  return list;
});

function send() {
  tried.value = true;
  welcomed.value = "";
  if (errors.value.length > 0) {
    return;
  }
  emit("submit", { name: name.value, email: email.value, plan: plan.value });
  welcomed.value = name.value;
}
</script>

<template>
  <form class="card" @submit.prevent="send">
    <p>
      <label for="name">Name</label>
      <input id="name" v-model.trim="name">
    </p>
    <p>
      <label for="email">Email</label>
      <input id="email" v-model.trim="email">
    </p>
    <p>
      <label for="plan">Plan</label>
      <select id="plan" v-model="plan">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="team">Team</option>
      </select>
    </p>
    <p>
      <input id="terms" type="checkbox" v-model="terms">
      <label for="terms">I accept the terms</label>
    </p>

    <template v-if="tried">
      <p v-for="error in errors" :key="error" class="error">{{ error }}</p>
    </template>
    <p v-if="welcomed" class="ok">Welcome, {{ welcomed }}!</p>

    <button type="submit">Create account</button>
  </form>
</template>
