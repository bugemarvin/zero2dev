---
title: Responsive design, states and dark mode
summary: A prefix decides when a class applies: from a screen width, on hover, in dark mode.
---

## Variants

A class can have a **variant** in front of it, with a colon. The class then applies only in that situation:

```html
<button class="bg-blue-600 hover:bg-blue-700">Order</button>
```

`bg-blue-600` always. `hover:bg-blue-700` when the mouse is over the button. That is the whole idea, and it covers everything you needed media queries and pseudo-classes for.

## Responsive: mobile first

Breakpoint variants mean "from this width **and up**":

| Variant | From |
| --- | --- |
| `sm:` | 640px (40rem) |
| `md:` | 768px (48rem) |
| `lg:` | 1024px (64rem) |
| `xl:` | 1280px (80rem) |
| `2xl:` | 1536px (96rem) |

A class with no variant applies at every width. So you write the **small-screen** design first, and add what changes as the screen grows:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

One column on a phone, two from 768px, four from 1024px. This is the [mobile-first approach](css/06-responsive) of the CSS track, in one attribute.

```html
<nav class="hidden md:flex gap-4">...</nav>         <!-- hidden on a phone, a flex row from 768px -->
<h1 class="text-2xl md:text-4xl">...</h1>           <!-- bigger on bigger screens -->
<div class="flex flex-col md:flex-row">...</div>    <!-- stacked, then side by side -->
```

There is no variant for "phones only". `sm:` does not mean "on small screens": it means 640px and wider. For the phone, write the class with no variant.

## States

| Variant | When |
| --- | --- |
| `hover:` | the pointer is over the element |
| `focus:` | the element has keyboard focus |
| `focus-visible:` | focus that should be shown: keyboard use |
| `active:` | while pressed |
| `disabled:` | a disabled form control |
| `first:`, `last:`, `odd:`, `even:` | position among siblings |

```html
<button class="bg-blue-600 hover:bg-blue-700 focus-visible:outline-2 disabled:opacity-50">
  Order
</button>
<input class="border border-gray-300 focus:border-blue-500">
```

Always style focus. People who use the keyboard need to see where they are.

## Transitions

A change of state looks better when it is not instant:

```html
<button class="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">Order</button>
```

## Parent and sibling state

Mark a parent with `group`, and its children can react to **its** state:

```html
<a class="group" href="#">
  <h3 class="group-hover:underline">House blend</h3>
  <p>Chocolate and hazelnut</p>
</a>
```

`peer` does the same between siblings: a message that appears when the input before it is invalid.

## Dark mode

`dark:` applies when the visitor's system is set to dark:

```html
<body class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
```

To switch with a button instead, the variant can be redefined to follow a class on the page:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

## Stacking variants

Variants combine, read from left to right:

```html
<button class="md:hover:bg-blue-700 dark:hover:bg-blue-500">
```

From 768px, on hover. In dark mode, on hover.

## Common mistakes

- **Designing for the desktop first**, then trying to undo it with `sm:`.
- **Reading `sm:` as "small screens only".**
- **`hidden md:block` on something that should be flex**: use `md:flex`.
- **Hover styles with no focus styles.**
- **A variant on a class that is not there by default** and wondering why nothing changed: `md:grid-cols-3` needs `grid` too.
