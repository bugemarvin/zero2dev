---
title: Flexbox
summary: Lay out items in a row or a column: spacing, alignment and wrapping.
---

## One dimension

**Flexbox** lays out the children of an element in **one direction**: a row or a column. It is the tool for navigation bars, toolbars, a row of cards, and centring things.

```html
<nav class="bar">
  <a href="#">Home</a>
  <a href="#">Menu</a>
  <a href="#">Visit</a>
</nav>
```

```css
.bar {
  display: flex;
  gap: 1rem;
}
```

`display: flex` goes on the **parent**, the **flex container**. Its direct children become **flex items** and line up in a row.

## The two axes

| | Default | Meaning |
| --- | --- | --- |
| main axis | left to right | the direction the items are laid out |
| cross axis | top to bottom | the other direction |

`flex-direction: column` turns it around: the main axis runs top to bottom.

## Properties of the container

| Property | Does | Common values |
| --- | --- | --- |
| `flex-direction` | the main axis | `row`, `column` |
| `justify-content` | distributes items along the **main** axis | `flex-start`, `center`, `flex-end`, `space-between`, `space-around` |
| `align-items` | positions items on the **cross** axis | `stretch`, `flex-start`, `center`, `flex-end` |
| `gap` | space between items | `1rem` |
| `flex-wrap` | may items move to a new line? | `nowrap`, `wrap` |

A header with a logo on the left and links on the right:

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## Centring, finally

```css
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

Centre on the main axis, centre on the cross axis: the child sits in the middle, horizontally and vertically.

## Properties of the items

| Property | Does |
| --- | --- |
| `flex-grow` | how much of the free space the item takes. `0` means none. |
| `flex-shrink` | how much it gives up when space is short |
| `flex-basis` | its starting size before growing or shrinking |
| `flex` | the three in one: `flex: 1` means "share the space equally" |
| `align-self` | overrides `align-items` for one item |

```css
.sidebar { flex: 0 0 240px; }    /* never grow, never shrink, 240px wide */
.content { flex: 1; }            /* takes the rest */
```

A trick worth knowing: an automatic margin eats all the free space on its side.

```css
.bar .login { margin-left: auto; }    /* pushes this item to the far right */
```

## Wrapping

```css
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.cards > * {
  flex: 1 1 200px;     /* at least about 200px, growing to fill the row */
}
```

The cards flow onto as many rows as they need. No media query is involved.

## Common mistakes

- **Putting `display: flex` on the items** in place of their parent.
- **Mixing up `justify-content` and `align-items`.** Justify is the main axis, align is the cross axis. They swap meaning when the direction is `column`.
- **Using margins for spacing between items** where `gap` does it without edge cases.
- **Expecting grandchildren to be flex items.** Only direct children are.
