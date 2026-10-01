---
title: Partials and modules
summary: Split a stylesheet into files, and say exactly what each file uses from the others.
---

## One file is not enough

A stylesheet for a real site in one file is a scroll bar and a search box. Sass lets you split it into small files and build one CSS file from them.

## Partials

A file whose name starts with an underscore is a **partial**. Sass does not compile it to a CSS file of its own. It exists to be used by other files.

```text
styles/
  style.scss          the entry point: this is what gets compiled
  _tokens.scss        colours, spacing, breakpoints
  _buttons.scss
  _card.scss
```

## @use

`@use` loads another file. Its variables, mixins and functions become available under a **namespace**, the file's name:

```scss
// _tokens.scss
$brand: #1a73e8;
$space: 16px;
```

```scss
// style.scss
@use "tokens";

.button {
  background-color: tokens.$brand;
  padding: tokens.$space;
}
```

- You write `"tokens"`: no underscore, no extension.
- `tokens.$brand` says where the variable comes from. In a project with thirty files, that is worth a great deal.
- `@use` rules go at the **top** of the file, before any other rule.
- A file is loaded **once**, however many files `@use` it. Its CSS is not duplicated.

Change the namespace, or drop it:

```scss
@use "tokens" as t;          // t.$brand
@use "tokens" as *;          // $brand, with no prefix
```

Use `as *` sparingly: it brings back the problem of not knowing where a name comes from.

## Private members

A name that starts with `-` or `_` is private to its file:

```scss
// _tokens.scss
$_base: 4px;                 // not visible outside
$space: $_base * 4;
```

## @forward

A folder often has one file that gathers the others, so users need a single `@use`:

```scss
// tokens/_index.scss
@forward "colors";
@forward "spacing";
```

```scss
@use "tokens";               // loads tokens/_index.scss
```

`@forward` passes a file's members on to whoever uses this one.

## @import is the old way

Older projects use `@import "tokens";`. It makes everything global: every variable of every imported file lands in one shared space, names collide, and you cannot tell where anything comes from. `@import` is deprecated in Sass and will be removed. Write `@use`.

## Built-in modules

Sass ships modules of functions, loaded the same way:

```scss
@use "sass:math";
@use "sass:color";

.third {
  width: math.div(100%, 3);
}

.button:hover {
  background-color: color.adjust(#1a73e8, $lightness: -10%);
}
```

| Module | Has |
| --- | --- |
| `sass:math` | `math.div`, `math.round`, `math.max`, `math.percentage` |
| `sass:color` | `color.adjust`, `color.scale`, `color.mix` |
| `sass:map` | `map.get`, `map.merge`, `map.keys` |
| `sass:string`, `sass:list` | functions for text and lists |

Division is `math.div(a, b)`. The `/` sign means too many things in CSS to be used for division.

## A structure that works

```text
styles/
  style.scss          only @use lines
  abstracts/          tokens, mixins, functions: no CSS output
  base/               reset, typography
  components/         _button.scss, _card.scss, ...
  layout/             _header.scss, _grid.scss, ...
```

One component per file. The entry file reads like a table of contents.

## Common mistakes

- **`@import`** in new code.
- **Writing the underscore or the extension** in `@use`.
- **`@use` below other rules.** It must come first.
- **Forgetting the namespace**: `$brand` is not found, `tokens.$brand` is.
- **A partial that outputs CSS and is used from many files**, in the belief that it will be repeated. It is included once.
