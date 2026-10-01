---
title: Layout: flexbox, grid and sizing
summary: The layout tools of CSS, as classes.
---

Everything here is [flexbox](css/04-flexbox) and [grid](css/05-grid) from the CSS track, written as classes.

## Display

| Class | CSS |
| --- | --- |
| `block`, `inline-block`, `inline` | `display: ...` |
| `flex`, `inline-flex` | `display: flex` |
| `grid` | `display: grid` |
| `hidden` | `display: none` |

## Flexbox

```html
<header class="flex items-center justify-between gap-4">
  <a href="/">Bean</a>
  <nav class="flex gap-4">...</nav>
</header>
```

| Class | CSS |
| --- | --- |
| `flex-row`, `flex-col` | `flex-direction` |
| `justify-start`, `justify-center`, `justify-between`, `justify-end` | `justify-content`: along the main axis |
| `items-start`, `items-center`, `items-end`, `items-stretch` | `align-items`: across it |
| `flex-wrap` | let items go to the next line |
| `flex-1` | grow and shrink to share the space |
| `shrink-0` | never shrink |
| `gap-4`, `gap-x-4`, `gap-y-2` | space between items |

## Grid

```html
<div class="grid grid-cols-3 gap-6">
  <article>...</article>
  <article>...</article>
  <article>...</article>
</div>
```

| Class | CSS |
| --- | --- |
| `grid-cols-3` | three equal columns: `repeat(3, minmax(0, 1fr))` |
| `col-span-2` | an item that is two columns wide |
| `grid-rows-2`, `row-span-2` | the same for rows |
| `place-items-center` | centre every item in its cell |

## Sizing

| Class | CSS |
| --- | --- |
| `w-64` | `width: 16rem` (the spacing scale) |
| `w-full`, `h-full` | 100% |
| `w-1/2`, `w-1/3` | fractions |
| `w-screen`, `h-screen`, `min-h-screen` | the viewport |
| `max-w-md`, `max-w-4xl` | a named maximum width |
| `size-10` | width and height together |

## The centred column

The most common layout on the web is a column with a maximum width, centred:

```html
<main class="max-w-4xl mx-auto px-4">...</main>
```

`max-w-4xl` limits the width, `mx-auto` shares the remaining space left and right, and `px-4` keeps the text off the edges on a small screen.

## Space between children

`gap` works in flex and grid containers. For plain stacked elements there is `space-y-4`, which puts a margin between each child and the next:

```html
<div class="space-y-4">
  <p>...</p>
  <p>...</p>
</div>
```

## Position

| Class | CSS |
| --- | --- |
| `relative`, `absolute`, `fixed`, `sticky` | `position` |
| `top-0`, `right-4`, `inset-0` | the offsets |
| `z-10`, `z-50` | `z-index` |

```html
<header class="sticky top-0 z-10 bg-white">...</header>
```

## Common mistakes

- **`justify-*` and `items-*` with no `flex` or `grid`** on the same element. They do nothing.
- **`grid-cols-3` with no `grid`.**
- **Classes on the wrong element.** Layout classes go on the **container**, not on the items.
- **`mx-auto` with no width or maximum width.** There is no space left to share.
- **Margins on items where `gap` on the container** would do.
