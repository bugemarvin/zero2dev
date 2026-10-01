---
title: Lists and conditions
summary: Show things only sometimes, repeat things for every item, and switch classes on and off.
---

## v-if

`v-if` puts an element on the page only when its condition is true:

```html
<p v-if="items.length === 0">Your cart is empty.</p>
<p v-else-if="items.length === 1">One item.</p>
<p v-else>{{ items.length }} items.</p>
```

`v-else-if` and `v-else` must come directly after a `v-if` element.

When the condition is false, the element **does not exist** in the page.

## v-show

`v-show` always creates the element and hides it with CSS (`display: none`):

```html
<p v-show="isOpen">Details ...</p>
```

| | `v-if` | `v-show` |
| --- | --- | --- |
| when false | the element is removed | the element is hidden |
| good for | things that rarely change | things toggled often |

To apply a condition to several elements without a wrapper, put it on a `<template>` tag, which produces no element of its own.

## v-for

`v-for` repeats an element for every item of a list:

```html
<ul>
  <li v-for="todo in todos" :key="todo.id">{{ todo.title }}</li>
</ul>
```

With the index, or over a number, or over the properties of an object:

```html
<li v-for="(todo, index) in todos" :key="todo.id">{{ index + 1 }}. {{ todo.title }}</li>
<span v-for="n in 5" :key="n">{{ n }}</span>
<li v-for="(value, key) in user" :key="key">{{ key }}: {{ value }}</li>
```

## Keys

Every repeated element needs a `:key` that **identifies the item**, such as its id. Vue uses the key to match old and new elements when the list changes. Without stable keys, a reordered list can show one item's text with another item's checkbox.

Do not use the index as a key if the list can be reordered, filtered, or have items removed: the index of an item changes, and the key is then worthless.

## Filter with computed, not in the template

Do not put `v-if` and `v-for` on the same element. Filter the list first:

```javascript
const open = computed(() => todos.value.filter((todo) => !todo.done));
```

```html
<li v-for="todo in open" :key="todo.id">{{ todo.title }}</li>
```

## Classes that depend on data

`:class` accepts an object: each key is a class name, added when its value is true.

```html
<li :class="{ done: todo.done, urgent: todo.priority > 2 }">{{ todo.title }}</li>
```

It combines with an ordinary `class`:

```html
<button class="tab" :class="{ active: current === 'home' }">Home</button>
```

An array works too: `:class="[size, { active: isActive }]"`. And `:style` takes an object of CSS properties: `:style="{ color: textColor, fontSize: size + 'px' }"`.

## Events in a list

Inside a `v-for`, the handler knows which item it belongs to:

```html
<li v-for="todo in todos" :key="todo.id">
  {{ todo.title }}
  <button @click="remove(todo.id)">Delete</button>
</li>
```

## Common mistakes

- **No `:key`**, or the index as the key in a list that changes.
- **`v-if` and `v-for` on the same element.**
- **`v-else` not directly after its `v-if`.**
- **`v-if` for something toggled many times a second**, where `v-show` is cheaper.
- **Filtering in the template** with a function that runs on every render.
