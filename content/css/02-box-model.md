---
title: The box model
summary: Every element is a box: content, padding, border, margin.
---

## Everything is a box

The browser draws every element as a rectangle with four layers:

```text
+-------------------------------------------+
|                 margin                    |
|   +-----------------------------------+   |
|   |             border                |   |
|   |   +---------------------------+   |   |
|   |   |         padding           |   |   |
|   |   |   +-------------------+   |   |   |
|   |   |   |      content      |   |   |   |
|   |   |   +-------------------+   |   |   |
|   |   +---------------------------+   |   |
|   +-----------------------------------+   |
+-------------------------------------------+
```

| Layer | What it is |
| --- | --- |
| content | the text or image |
| padding | space **inside** the border. The background colour fills it. |
| border | a line around the padding |
| margin | space **outside** the border, between this box and its neighbours. Always transparent. |

```css
.card {
  padding: 16px;
  border: 1px solid #cccccc;
  margin: 24px;
}
```

## One to four values

`padding` and `margin` are shorthands for four sides:

| Written | Meaning |
| --- | --- |
| `margin: 10px` | all four sides |
| `margin: 10px 20px` | top and bottom 10, left and right 20 |
| `margin: 10px 20px 30px` | top 10, left and right 20, bottom 30 |
| `margin: 10px 20px 30px 40px` | top, right, bottom, left: clockwise from the top |

One side at a time: `margin-top`, `padding-left`, and so on.

## Width and box-sizing

By default, `width` is the width of the **content** only. Padding and border are added on top:

```css
.card { width: 300px; padding: 20px; border: 5px solid black; }
/* takes 300 + 20 + 20 + 5 + 5 = 350px */
```

That surprises everyone. Almost every project starts with this rule, which makes `width` include padding and border:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

Now a `300px` wide card is 300px wide, whatever its padding.

## Block and inline

| `display` | Behaviour | Examples |
| --- | --- | --- |
| `block` | starts on a new line and takes the full width | `div`, `p`, `h1`, `section` |
| `inline` | flows inside a line of text. `width` and `height` are ignored. | `a`, `span`, `strong` |
| `inline-block` | flows in the line, and accepts a width and height | |
| `none` | not shown at all, and takes no space | |

## Centring a block

A block with a width and automatic left and right margins sits in the middle:

```css
.page {
  max-width: 700px;
  margin: 0 auto;
}
```

`max-width` in place of `width` lets the block shrink on a narrow screen.

## Margins collapse

When two vertical margins touch, they do not add up. The larger one wins:

```css
h2 { margin-bottom: 30px; }
p  { margin-top: 20px; }
/* the gap between them is 30px, not 50px */
```

This happens only top-to-bottom, and not inside flex or grid containers.

## Borders and corners

```css
.card {
  border: 1px solid #cccccc;      /* width, style, colour */
  border-radius: 8px;             /* rounded corners */
}
```

## Common mistakes

- **Forgetting `box-sizing: border-box`** and wondering why things are too wide.
- **Setting `width` on an inline element**, where it does nothing.
- **Using margin where padding is meant**: the background does not extend into the margin.
- **`margin: auto` on a block with no width.** It already fills the line, so there is nothing to centre.
- **A fixed `width`** that overflows on a phone. Prefer `max-width`.
