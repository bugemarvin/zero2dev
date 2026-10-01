---
title: Selectors and the cascade
summary: How a rule finds its elements, and which rule wins when two disagree.
---

## What CSS is

HTML says what each part of a page **is**. **CSS** (Cascading Style Sheets) says how it **looks**: colours, fonts, spacing, position.

Put your CSS in its own file and link it from the head of the page:

```html
<link rel="stylesheet" href="style.css">
```

## A rule

```css
h1 {
  color: navy;
  font-size: 2rem;
}
```

- `h1` is the **selector**: which elements the rule applies to.
- Between the braces are **declarations**: a **property**, a colon, a **value**, a semicolon.

## Selectors

| Selector | Matches |
| --- | --- |
| `p` | every `p` element |
| `.note` | every element with `class="note"` |
| `#top` | the element with `id="top"` |
| `a[href]` | `a` elements that have an `href` attribute |
| `h1, h2` | `h1` elements and `h2` elements |
| `nav a` | `a` elements anywhere inside a `nav` |
| `ul > li` | `li` elements that are direct children of a `ul` |
| `p.note` | `p` elements with the class `note` (no space) |
| `*` | every element |

Classes are the workhorse. Give an element a class in the HTML, and style the class.

## States and positions

A **pseudo-class** selects an element in a certain state or position:

```css
a:hover { text-decoration: underline; }     /* the mouse is over it */
input:focus { outline: 2px solid blue; }    /* the keyboard is in it */
li:first-child { font-weight: bold; }
li:nth-child(even) { background-color: #f4f4f4; }
```

## The cascade: which rule wins

Several rules can set the same property on the same element. The browser picks one, in this order:

1. A declaration marked `!important` beats one that is not.
2. Otherwise the more **specific** selector wins.
3. Otherwise the rule that comes **later** in the file wins.

**Specificity** counts what the selector is made of:

| Selector | ids | classes | elements |
| --- | --- | --- | --- |
| `p` | 0 | 0 | 1 |
| `.note` | 0 | 1 | 0 |
| `p.note` | 0 | 1 | 1 |
| `nav a:hover` | 0 | 1 | 2 |
| `#top` | 1 | 0 | 0 |

Compare from the left: any id beats any number of classes, and any class beats any number of elements. Pseudo-classes and attribute selectors count as classes.

```css
p { color: black; }
.note { color: green; }    /* wins on <p class="note">: a class beats an element */
```

Keep specificity low. Style with single classes, avoid ids in selectors, and treat `!important` as a last resort: the only thing that beats it is another `!important`.

## Inheritance

Some properties pass from an element to everything inside it: `color`, `font-family`, `font-size`, `line-height`, `text-align`. So set them once, on `body`:

```css
body {
  font-family: system-ui, sans-serif;
  color: #222;
}
```

Box properties such as `margin`, `padding`, `border` and `background-color` are **not** inherited.

## Inspect it

In the browser's developer tools (F12), click an element and look at the **Styles** panel. It lists every rule that matches, with the losing declarations struck through. When a style "does not work", this panel tells you which rule won.

## Common mistakes

- **A space where none is meant.** `p.note` is a paragraph with the class. `p .note` is something with the class *inside* a paragraph.
- **A missing semicolon**, which swallows the next declaration.
- **Fighting specificity with `!important`.**
- **A typo in a property name.** The browser ignores the line without an error.
- **Forgetting the dot**: `note { }` matches a `<note>` element, which does not exist.
