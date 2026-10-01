---
title: Your own theme, and one-off values
summary: Add your brand's colours, fonts and breakpoints, and step off the scale when you must.
---

## The theme is CSS variables

Every colour, font and size that Tailwind offers comes from a **theme variable**. You add your own in your CSS file, in an `@theme` block:

```css
@import "tailwindcss";

@theme {
  --color-brand: #1a73e8;
  --color-brand-dark: #1557b0;
  --font-display: "Georgia", serif;
}
```

Each variable creates classes. The first part of its name decides which:

| Variable | Gives you |
| --- | --- |
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand`, and every other colour class |
| `--font-display` | `font-display` |
| `--breakpoint-3xl: 120rem` | the variant `3xl:` |
| `--spacing: 0.25rem` | the size of one spacing step, for the whole scale |
| `--radius-card: 0.75rem` | `rounded-card` |
| `--shadow-card: ...` | `shadow-card` |

```html
<button class="bg-brand hover:bg-brand-dark text-white font-display">Order</button>
```

The names follow the pattern exactly: a colour must start with `--color-`, a font with `--font-`.

The variables are also real CSS variables on the page, so your own CSS can use them: `color: var(--color-brand)`.

## Replacing instead of adding

`@theme` **adds** to the default theme. To throw away a whole group first, set it to `initial`:

```css
@theme {
  --color-*: initial;          /* remove every default colour */
  --color-brand: #1a73e8;
  --color-ink: #1b1b1f;
  --color-paper: #ffffff;
}
```

A small, strict palette keeps a design consistent: nobody can reach for `pink-300` when it does not exist.

## Arbitrary values

Sometimes a design needs a value that is not on any scale. Put it in square brackets:

```html
<div class="w-[320px] top-[117px] bg-[#1da1f2]">
<div class="grid grid-cols-[200px_1fr]">
```

In brackets, a space is written as an underscore. A CSS variable works too: `bg-(--my-colour)`.

Use these for real one-offs. If the same bracket value appears a third time, it belongs in the theme.

## Opacity

A colour takes an opacity after a slash:

```html
<div class="bg-black/50 text-white/90">
```

## Your own utilities

A class that Tailwind does not have can be added with `@utility`, and it then works with every variant:

```css
@utility text-shadow-soft {
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
}
```

```html
<h1 class="text-shadow-soft md:hover:text-shadow-soft">
```

## Where Tailwind looks for classes

Tailwind scans the files of your project, and skips what `.gitignore` lists and `node_modules`. If classes live somewhere else, such as a package of components, name the place:

```css
@source "../node_modules/my-ui-library";
```

## Older projects

Tailwind before version 4 was configured in a JavaScript file, `tailwind.config.js`, and its CSS started with three `@tailwind` lines. You will meet it in existing projects. The classes are nearly all the same.

## Common mistakes

- **A theme variable with the wrong prefix.** `--brand: ...` creates no class. `--color-brand` does.
- **Bracket values everywhere**, which undoes the consistency of a scale.
- **A space inside brackets.** Use an underscore.
- **Ten shades of blue that are almost the same**, added one by one. Decide on a palette.
- **Changing `--spacing`** and being surprised that every padding on the site changed.
