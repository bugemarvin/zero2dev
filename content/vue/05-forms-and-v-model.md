---
title: Forms and v-model
summary: Two-way binding between form fields and your data, with validation and submitting.
---

## v-model

`v-model` connects a form field to a `ref` in **both directions**: typing changes the data, and changing the data changes the field.

```html
<script setup>
import { ref } from "vue";

const name = ref("");
</script>

<template>
  <label for="name">Name</label>
  <input id="name" v-model="name">
  <p>Hello, {{ name }}!</p>
</template>
```

It is a shorthand for binding the value and listening for input:

```html
<input :value="name" @input="name = $event.target.value">
```

## The kinds of field

```html
<textarea v-model="message"></textarea>

<input type="checkbox" v-model="accepted">                  <!-- true or false -->

<input type="radio" value="basic" v-model="plan">
<input type="radio" value="pro" v-model="plan">             <!-- plan is "basic" or "pro" -->

<select v-model="country">
  <option value="">Choose one</option>
  <option value="ke">Kenya</option>
</select>
```

Several checkboxes bound to the same **array** collect their values:

```html
<input type="checkbox" value="email" v-model="channels">
<input type="checkbox" value="sms" v-model="channels">       <!-- channels is ["email", "sms"] -->
```

## Modifiers

| Modifier | Effect |
| --- | --- |
| `v-model.trim` | removes spaces at both ends |
| `v-model.number` | converts the text to a number |
| `v-model.lazy` | updates when the field loses focus, not on every key |

```html
<input v-model.trim="name">
<input type="number" v-model.number="age">
```

Without `.number`, the value of every input is a string, including `type="number"`.

## Submitting

```html
<form @submit.prevent="send">
  ...
  <button type="submit">Send</button>
</form>
```

`@submit` on the form catches both the button and the Enter key. `.prevent` stops the browser from reloading the page.

## Validation

Work out the errors with `computed`, from the data:

```javascript
const email = ref("");
const password = ref("");

const errors = computed(() => {
  const list = {};
  if (!email.value.includes("@")) {
    list.email = "Enter a valid email";
  }
  if (password.value.length < 8) {
    list.password = "At least 8 characters";
  }
  return list;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);
```

```html
<input id="email" v-model.trim="email">
<p v-if="errors.email" class="error">{{ errors.email }}</p>

<button type="submit" :disabled="!isValid">Sign up</button>
```

Showing every error before the user has typed anything is unfriendly. A common pattern keeps a `submitted` flag, or a `touched` flag per field, and shows errors only after it is set.

Validation in the browser is a convenience for the user. The **server must check again**: anyone can send a request without your form.

## One object for the whole form

```javascript
import { reactive } from "vue";

const form = reactive({ name: "", email: "", plan: "basic" });
```

```html
<input v-model="form.name">
<input v-model="form.email">
```

To send it: `emit("submit", { ...form })`. The spread makes a plain copy, so the receiver does not hold your reactive object.

## Labels

Every field needs a `label` whose `for` equals the field's `id`. It makes the label clickable and tells screen readers what the field is. A `placeholder` is not a label.

## Common mistakes

- **Forgetting `.prevent`**, so the page reloads on submit.
- **Expecting a number** from an input without `.number`.
- **Handling only the button's click**, which misses the Enter key. Listen for `submit` on the form.
- **A separate `ref` for "is the form valid"** that is updated by hand.
- **No server-side validation.**
