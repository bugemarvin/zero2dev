---
title: Responsive design
summary: One page that works on a phone, a laptop and everything between.
---

## The viewport tag

Without this line, a phone pretends to be 980 pixels wide and shows your page zoomed out:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

It belongs in the head of every page.

## Start with a page that already flows

Most of a responsive design needs no special code:

- Blocks fill the width they are given, and text wraps.
- `max-width` in place of `width` lets things shrink.
- `flex-wrap` and `repeat(auto-fit, minmax(...))` move items to the next row.

And one rule that prevents wide images from breaking the layout:

```css
img {
  max-width: 100%;
  height: auto;
}
```

## Media queries

A **media query** applies rules only when a condition holds:

```css
.layout {
  display: grid;
  grid-template-columns: 1fr;          /* one column: the phone layout */
  gap: 1rem;
}

@media (min-width: 700px) {
  .layout {
    grid-template-columns: 240px 1fr;  /* a sidebar from 700px up */
  }
}
```

A rule inside the block competes with the others under the normal cascade rules. It has no extra weight, so put media queries **after** the rules they override.

## Mobile first

The example above is written **mobile first**: the base rules describe the small screen, and `min-width` queries add to them as the screen grows. This is the usual way, for two reasons:

- the small layout is the simple one, usually a single column, so it makes a good base;
- a phone, the slowest device, uses the least CSS.

The width at which a layout changes is a **breakpoint**. Do not pick breakpoints from a list of devices. Narrow the browser window until the layout looks wrong, and put the breakpoint there.

## Other things you can ask

| Query | True when |
| --- | --- |
| `(min-width: 700px)` | the window is at least 700px wide |
| `(max-width: 699px)` | the window is at most 699px wide |
| `(orientation: landscape)` | the window is wider than it is tall |
| `(prefers-color-scheme: dark)` | the user's system is in dark mode |
| `(prefers-reduced-motion: reduce)` | the user asked for less animation |
| `(hover: hover)` | the device has a pointer that can hover |

## Sizes that scale by themselves

```css
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

`clamp(minimum, preferred, maximum)`: the size follows the window width and never leaves the limits.

## Touch

On a phone there is no mouse and no hover. Make links and buttons at least about 44 by 44 pixels, and never hide information behind `:hover` alone.

## Test it

In the developer tools, the device toolbar (Ctrl+Shift+M) shows the page at any width. Drag the edge slowly and watch for the moment the layout breaks.

## Common mistakes

- **No viewport meta tag.**
- **Fixed widths in pixels** that cause sideways scrolling. A page should never scroll sideways.
- **Desktop first**, then a pile of `max-width` queries to undo it.
- **Media queries before the base rule**, where they lose the cascade.
- **Hiding content on mobile.** Phone users want the same information.
