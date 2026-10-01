---
title: What Sass is, and variables
summary: A language that compiles to CSS, and the first thing it gives you: names for your values.
---

This track builds on [CSS](css/01-selectors-and-cascade).

## The problem

A real stylesheet has thousands of lines. The same blue appears in forty places, the same media query in sixty, and the button styles are copied with small changes for every kind of button. CSS, for most of its history, had no way to say "this value has a name" or "this block is used again over there".

**Sass** is a language that adds those things. You write Sass, a program turns it into ordinary CSS, and the browser only ever sees CSS.

```text
style.scss  --sass-->  style.css  -->  browser
```

## Two syntaxes

Sass has two ways of writing. This track uses **SCSS**, the common one: it looks like CSS with extras, and **every valid CSS file is already valid SCSS**. You can rename a `.css` file to `.scss` and start from there.

## Compiling

```console
$ npm install --save-dev sass
$ npx sass style.scss style.css
$ npx sass --watch style.scss style.css       # compile again on every save
```

In a project built with Vite, Next.js or similar, you install `sass`, import a `.scss` file, and the build tool compiles it for you. In the exercises of this track, **Run tests** compiles your file.

## Variables

A variable starts with `$`:

```scss
$brand: #1a73e8;
$radius: 8px;
$space: 16px;

.button {
  background-color: $brand;
  border-radius: $radius;
  padding: $space;
}

.card {
  border: 1px solid $brand;
  border-radius: $radius;
}
```

The compiled CSS has the values filled in:

```css
.button {
  background-color: #1a73e8;
  border-radius: 8px;
  padding: 16px;
}
```

Change `$brand` in one place, compile, and every use follows.

## Arithmetic

Sass can calculate with numbers that have units:

```scss
$space: 16px;

.card {
  padding: $space * 2;          // 32px
  margin-bottom: $space + 4px;  // 20px
}
```

## Comments

```scss
// A line comment. It is NOT copied into the CSS.
/* A block comment. It is copied into the CSS. */
```

## Sass variables and CSS custom properties

CSS now has its own variables, the custom properties from [the CSS track](css/03-colours-fonts-units): `--brand: #1a73e8` and `var(--brand)`. They are not the same thing.

| | Sass `$variable` | CSS `--property` |
| --- | --- | --- |
| exists | only while compiling | in the browser, at run time |
| can change on the page | no | yes: with a class, a media query, JavaScript |
| can be used in Sass arithmetic, loops, functions | yes | no |

Use a custom property for anything that changes while the page is open, such as a light and a dark theme. Use a Sass variable for values that are fixed when you build: breakpoints, a spacing scale, things you calculate with. They combine well:

```scss
$brand: #1a73e8;

:root {
  --brand: #{$brand};
}
```

`#{ }` is **interpolation**: it puts a Sass value into a place where Sass would otherwise leave the text alone.

## Scope

A variable declared at the top of the file is available everywhere below. One declared inside a rule exists only in that rule.

## Common mistakes

- **Linking the `.scss` file from HTML.** The browser cannot read it. Link the compiled `.css`.
- **Editing the compiled `.css`.** The next compile overwrites it.
- **Expecting a Sass variable to change at run time.**
- **The same value typed in many places** in place of one variable.
