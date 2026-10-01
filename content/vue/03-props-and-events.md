---
title: Props, events and slots
summary: How components talk: data goes down, events come up, content goes in.
---

## Props: data goes down

A parent passes data to a child through **props**. The child declares what it accepts:

```html
<!-- PriceTag.vue -->
<script setup>
const props = defineProps({
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
});
</script>

<template>
  <span>{{ amount }} {{ currency }}</span>
</template>
```

The parent uses them like attributes:

```html
<PriceTag :amount="12.5" />
<PriceTag :amount="total" currency="EUR" />
```

- With a colon, the value is JavaScript: `:amount="12.5"` passes a number. Without it, `amount="12.5"` passes the string.
- In the template a prop is used by its name. In the script it is `props.amount`.
- `defineProps` needs no import: it is built into `<script setup>`.

## Props are read-only

A child must **not** change a prop. The data belongs to the parent. Vue warns if you try.

If the child needs a changing copy, it makes its own `ref` from the prop. If the child wants the **parent** to change the data, it asks, with an event.

## Events: messages go up

A child announces that something happened. The parent decides what to do.

```html
<!-- AddButton.vue -->
<script setup>
const emit = defineEmits(["add"]);
</script>

<template>
  <button @click="emit('add', 1)">Add one</button>
</template>
```

```html
<!-- the parent -->
<AddButton @add="count += $event" />
<AddButton @add="onAdd" />
```

- `emit("add", 1)` sends the event `add` with the value 1.
- The parent listens with `@add`. A handler function receives the value as its argument.

This one-way flow, **props down and events up**, is what keeps a large application understandable: you can always tell who owns a piece of data.

## Slots: content goes in

A **slot** lets the parent put its own content inside the child:

```html
<!-- Card.vue -->
<template>
  <div class="card">
    <slot>Nothing here yet</slot>
  </div>
</template>
```

```html
<Card>
  <h2>Hello</h2>
  <p>Any content at all.</p>
</Card>
```

What is written between the tags replaces `<slot>`. The text inside `<slot>` is the fallback, shown when the parent gives nothing.

**Named slots** give a component several places:

```html
<!-- Layout.vue -->
<header><slot name="title" /></header>
<main><slot /></main>
```

```html
<Layout>
  <template #title>Settings</template>
  <p>The main content.</p>
</Layout>
```

## v-model on a component

A component that edits a value follows a convention: a prop named `modelValue` and an event named `update:modelValue`. The parent can then write `v-model`:

```html
<StarRating v-model="stars" />
<!-- is the same as -->
<StarRating :modelValue="stars" @update:modelValue="stars = $event" />
```

Recent versions of Vue offer `defineModel()` as a shortcut for the child's side.

## Common mistakes

- **Changing a prop in the child.**
- **Forgetting the colon**, and passing the text `"5"` where the number 5 was meant.
- **An event that is emitted and never declared** in `defineEmits`.
- **Passing a callback function as a prop** where an event is the Vue way.
- **Passing data through five layers of props.** For that, Vue has `provide` and `inject`, and stores such as Pinia.
