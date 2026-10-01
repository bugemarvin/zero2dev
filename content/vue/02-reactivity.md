---
title: Reactivity: ref and computed
summary: Data that the page follows, and values that are worked out from other values.
---

## ref

`ref` wraps a value in a small object. Vue watches that object: when its `.value` changes, everything on the page that uses it is updated.

```html
<script setup>
import { ref } from "vue";

const count = ref(0);

function add() {
  count.value += 1;
}
</script>

<template>
  <p>Count: {{ count }}</p>
  <button @click="add">Add</button>
</template>
```

- In the **script**: `count.value`.
- In the **template**: `count`, with no `.value`.

A `ref` can hold anything: a number, a string, an array, an object.

## Changing objects and arrays

Unlike React, you **can** change a reactive array or object in place. Vue notices:

```javascript
const todos = ref([]);
todos.value.push({ title: "Learn Vue", done: false });     // the page updates
todos.value[0].done = true;                                 // so does this
```

## reactive

`reactive` makes an object reactive without the `.value`:

```javascript
import { reactive } from "vue";

const form = reactive({ name: "", email: "" });
form.name = "Sam";
```

It works only for objects, and it breaks if you pull a property out into a variable (`const { name } = form` gives a plain, dead value). Many teams use `ref` everywhere for that reason. Either is fine: be consistent.

## computed

A **computed** value is worked out from other reactive values, and stays up to date by itself:

```javascript
import { ref, computed } from "vue";

const price = ref(20);
const quantity = ref(3);

const total = computed(() => price.value * quantity.value);
```

- `total.value` is 60. Change `quantity`, and `total` is 80 the next time anyone looks.
- It is **cached**: the function runs again only when something it used has changed.
- It is read-only. You never assign to it.

Use `computed` for anything that can be derived. Do not keep a second `ref` that you update by hand: it will fall out of step.

```javascript
const items = ref([{ done: true }, { done: false }]);

const remaining = computed(() => items.value.filter((item) => !item.done).length);
const isEmpty = computed(() => items.value.length === 0);
```

## Methods or computed?

A function called from the template runs again on **every** render. A computed runs only when its inputs change. For values, prefer `computed`. Use functions for things that **do** something, such as event handlers.

## watch

`watch` runs code when a value changes. It is for **side effects**: saving, logging, fetching.

```javascript
import { watch } from "vue";

watch(count, (now, before) => {
  console.log(`count went from ${before} to ${now}`);
});
```

If you only need a value, `computed` is the right tool. Reach for `watch` when something outside the component must happen.

## Updates are batched

When you change a `ref`, the page is updated a moment later, once, even if you changed ten things. Code that needs the updated page waits for it:

```javascript
import { nextTick } from "vue";

count.value++;
await nextTick();       // now the DOM shows the new count
```

## Common mistakes

- **`count++` in the script** in place of `count.value++`.
- **Destructuring a `reactive` object**, which loses the reactivity.
- **A `ref` kept in sync by hand** where a `computed` would do it.
- **Changing something inside a `computed`.** It must only calculate.
- **`watch` for a derived value.**
