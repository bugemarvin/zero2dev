---
title: Utility-first CSS
summary: Style an element by listing small classes on it, and how Tailwind builds only the CSS you use.
---

This track builds on [CSS](css/01-selectors-and-cascade). Tailwind does not replace knowing CSS: every class is one or two CSS declarations, and you need to know what they do.

## Two ways to style a card

The way you learned in the CSS track: invent a class name, then write its rules in a stylesheet.

```html
<article class="card">...</article>
```

```css
.card {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
}
```

The **utility-first** way: use small classes that already exist, each doing one thing.

```html
<article class="p-6 bg-white rounded-lg">...</article>
```

No stylesheet to write, no name to invent. `p-6` is padding, `bg-white` is the background, `rounded-lg` is the border radius. **Tailwind CSS** is the best-known library of such classes.

## Why people like it

- **No naming.** You do not have to decide whether it is a `card`, a `panel` or a `box-wrapper`.
- **Changes are local.** You change this element's classes. Nothing else on the site can break.
- **The CSS stops growing.** Two hundred components reuse the same few hundred utilities.
- **A design system for free.** Spacing, sizes and colours come from a fixed scale, so pages look consistent.

And the cost: the HTML gets long. Lesson 5 shows how that is handled.

## How it is built

Tailwind is not a big CSS file that you download. It is a **compiler**:

```text
your HTML and components  --tailwind-->  one CSS file with only the classes you used
```

It reads your files, finds the class names, and generates CSS for exactly those. A class you never use costs nothing.

## Setting it up

In a project with Vite (React, Vue and others):

```console
$ npm install tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

Without a build tool, the command-line program does the same:

```console
$ npm install tailwindcss @tailwindcss/cli
$ npx @tailwindcss/cli -i input.css -o style.css --watch
```

In both cases your CSS file starts with one line:

```css
@import "tailwindcss";
```

The exercises in this track use the command-line program: `input.css` is compiled to `style.css`, which the page links.

## The spacing scale

Spacing classes take a number. One step is `0.25rem`, which is 4 pixels with default settings.

| Class | CSS |
| --- | --- |
| `p-4` | `padding: 1rem` |
| `px-4` | left and right padding |
| `py-2` | top and bottom padding |
| `pt-2`, `pr-2`, `pb-2`, `pl-2` | one side |
| `m-4`, `mx-auto`, `mt-6` | margin, the same pattern |
| `gap-4` | the gap in a flex or grid container |
| `w-64`, `h-10` | width and height |

So `p-6` is 1.5rem, and `mt-2` is 0.5rem.

## Colour

Colours have a name and a shade from 50 (lightest) to 950 (darkest):

| Class | Sets |
| --- | --- |
| `text-gray-600` | the text colour |
| `bg-blue-600` | the background |
| `border-red-500` | the border colour |
| `bg-white`, `text-black` | plain white and black |

## Text

| Class | CSS |
| --- | --- |
| `text-sm`, `text-base`, `text-xl`, `text-3xl` | font size |
| `font-bold`, `font-semibold`, `font-medium` | font weight |
| `text-center`, `text-right` | alignment |
| `uppercase`, `underline`, `italic` | what they say |
| `leading-relaxed`, `tracking-wide` | line height and letter spacing |

## Borders and shadows

| Class | CSS |
| --- | --- |
| `border`, `border-2` | a border of 1 or 2 pixels |
| `rounded`, `rounded-lg`, `rounded-full` | border radius |
| `shadow-sm`, `shadow-md`, `shadow-lg` | box shadows |

## The reset

Tailwind starts by removing the browser's default styles: headings are the same size as text, lists have no bullets, margins are zero. A bare `<h1>` looks like a paragraph until you give it classes. That is on purpose: every page starts from the same blank state.

## Do not build class names

Tailwind finds classes by reading your files as text. It cannot run your code.

```javascript
const colour = "red";
const cls = "text-" + colour + "-600";      // never found: this class is not generated
```

Write complete class names: `error ? "text-red-600" : "text-green-600"`.

## Common mistakes

- **Expecting headings to be big.** The reset removed that. Add `text-2xl font-bold`.
- **A class that does nothing**, because it is misspelled or does not exist. Look at the compiled CSS, or use the editor extension that completes class names.
- **Building class names from pieces** in code.
- **Fighting the scale** with odd values everywhere. The scale is the point.
- **Skipping CSS.** If you do not know what `flex` does in CSS, the class `flex` will not help you.
