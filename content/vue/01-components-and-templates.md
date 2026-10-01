---
title: Components and templates
summary: What Vue is, the single-file component, and the template syntax that connects data to the page.
---

This track builds on [HTML](html/01-page-structure), [CSS](css/01-selectors-and-cascade) and [JavaScript](js/01-values-and-functions).

## What Vue is

Vue is a framework for building user interfaces out of **components**: small, reusable pieces that each own a bit of the page. You describe what the page should look like for the current data, and Vue keeps the page in step when the data changes.

It solves the same problem as [React](react/01-components-and-jsx), with a different feel: Vue keeps HTML, JavaScript and CSS recognisable, in one file per component.

## A single-file component

A component lives in a `.vue` file with up to three blocks:

```html
<script setup>
const name = "Ada";
</script>

<template>
  <p class="hello">Hello, {{ name }}!</p>
</template>

<style scoped>
.hello { color: teal; }
</style>
```

| Block | Holds |
| --- | --- |
| `<script setup>` | the component's JavaScript. Every variable and function declared here can be used in the template. |
| `<template>` | the HTML of the component, with Vue's additions |
| `<style scoped>` | CSS that applies **only** to this component |

## Text: double braces

`{{ }}` puts the value of a JavaScript expression into the text:

```html
<p>{{ name }} has {{ items.length }} items, total {{ price * 2 }}</p>
```

Vue escapes the value, so text from a user cannot inject HTML.

## Attributes: v-bind

Braces do not work inside attributes. Use `v-bind:`, or its short form, a colon:

```html
<img :src="photoUrl" :alt="name">
<a :href="site">Website</a>
<button :disabled="isSaving">Save</button>
```

With the colon, the value is a JavaScript expression. Without it, plain text.

## Events: v-on

`v-on:`, or its short form `@`, runs code when something happens:

```html
<button @click="count++">Add</button>
<button @click="save">Save</button>
<form @submit.prevent="send">...</form>
```

`.prevent` is a **modifier**: it calls `preventDefault()` for you, which stops a form from reloading the page.

## Data that changes

An ordinary variable can be shown, but changing it does not update the page. Wrap it with `ref` to make it **reactive**:

```html
<script setup>
import { ref } from "vue";

const following = ref(false);

function toggle() {
  following.value = !following.value;
}
</script>

<template>
  <button @click="toggle">{{ following ? "Following" : "Follow" }}</button>
</template>
```

In the script you read and write `following.value`. In the template you write just `following`: Vue unwraps it. The next lesson is all about this.

## Using a component

Import it and use it as a tag:

```html
<script setup>
import ProfileCard from "./ProfileCard.vue";
</script>

<template>
  <ProfileCard />
  <ProfileCard />
</template>
```

Each use is a separate copy with its own state.

## Starting a real project

```console
$ npm create vue@latest
$ cd my-app
$ npm install
$ npm run dev
```

That sets up Vite, which compiles `.vue` files and reloads the page as you save. The exercises of this track are prepared for you in the same way.

## Common mistakes

- **Braces in an attribute**: `href="{{ site }}"` does not work. Write `:href="site"`.
- **Forgetting `.value`** in the script, or writing it in the template.
- **A plain variable where a `ref` is needed.** The page shows the first value for ever.
- **`@click="save()"` versus `@click="save"`.** Both work in Vue. With brackets you can pass arguments.
