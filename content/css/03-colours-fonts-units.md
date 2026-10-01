---
title: Colours, fonts, units and variables
summary: Readable text, sizes that scale, and values you name once and reuse.
---

## Colours

| Form | Example | Notes |
| --- | --- | --- |
| name | `navy`, `white`, `tomato` | about 140 names |
| hex | `#1a73e8`, `#fff` | red, green, blue in base 16. `#fff` is short for `#ffffff`. |
| rgb | `rgb(26 115 232)` | the same three numbers in decimal, 0 to 255 |
| with transparency | `rgb(0 0 0 / 0.5)` | the last number is opacity, 0 to 1 |
| hsl | `hsl(215 80% 50%)` | hue (0 to 360), saturation, lightness. Easy to adjust by hand. |

```css
.alert {
  color: #7a0000;               /* the text */
  background-color: #ffe5e5;
}
```

Text must **contrast** with its background. Light grey on white looks elegant and cannot be read by many people. The developer tools show the contrast ratio when you click a colour: aim for 4.5 or more for normal text.

## Fonts

```css
body {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}
```

- `font-family` is a list. The browser uses the first font it has. Always end with a generic family: `sans-serif`, `serif` or `monospace`.
- `system-ui` is the font of the operating system. It needs no download and looks native.
- `line-height: 1.5` is the space between lines, as a multiple of the font size. Write it without a unit.

| Property | Values |
| --- | --- |
| `font-weight` | `normal` (400), `bold` (700), or a number |
| `font-style` | `normal`, `italic` |
| `text-align` | `left`, `center`, `right` |
| `text-transform` | `uppercase`, `lowercase`, `capitalize` |
| `text-decoration` | `none`, `underline` |

## Units

| Unit | Relative to | Use for |
| --- | --- | --- |
| `px` | nothing: a fixed size | borders, small details |
| `rem` | the font size of the root element (16px by default) | font sizes, spacing |
| `em` | the font size of the element itself | padding that should grow with the text |
| `%` | the parent's size | widths |
| `vw`, `vh` | 1% of the window's width or height | full-screen sections |

Use `rem` for font sizes. A person who sets a larger default text size in their browser then gets larger text on your page too. With `px` they get nothing.

```css
h1 { font-size: 2rem; }       /* 32px by default */
.small { font-size: 0.875rem; }
```

## Custom properties: variables

Name a value once, use it everywhere:

```css
:root {
  --brand: #1a73e8;
  --space: 1rem;
}

.button {
  background-color: var(--brand);
  padding: var(--space);
}

a {
  color: var(--brand);
}
```

- A custom property starts with two dashes.
- `:root` is the `html` element. Properties set there are available on the whole page, because custom properties are inherited.
- `var(--name)` reads the value. `var(--name, grey)` gives a fallback.

Change `--brand` in one place and every use changes. A dark theme is the same variables with other values:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --text: #eeeeee;
    --page: #111111;
  }
}
```

## Common mistakes

- **Font sizes in `px`**, which ignore the reader's settings.
- **A font family with no generic fallback.**
- **`line-height` with a unit** such as `24px`, which does not scale when the font size changes.
- **Low contrast.**
- **The same colour typed in twenty places** in place of one variable.
