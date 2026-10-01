---
title: Mixins and functions
summary: Reuse whole blocks of declarations, and calculate values of your own.
---

## Mixins

A **mixin** is a named block of declarations that you can include anywhere:

```scss
@mixin card {
  padding: 16px;
  border: 1px solid #cccccc;
  border-radius: 8px;
}

.product {
  @include card;
}

.comment {
  @include card;
  background: #fafafa;
}
```

`@mixin` defines it, `@include` uses it. The declarations are copied into each place.

## Arguments

A mixin can take arguments, with default values:

```scss
@mixin button($background, $text: white) {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: $background;
  color: $text;
}

.button-primary {
  @include button(#1a73e8);
}

.button-warning {
  @include button(#f6ad55, $text: #222222);
}
```

One definition, any number of variations, and a change to the padding happens in one place.

## @content: pass a block in

A mixin can receive a whole block of styles, and decide where it goes. This is the classic use, a media query with a name:

```scss
@mixin from($width) {
  @media (min-width: $width) {
    @content;
  }
}

.layout {
  display: grid;
  grid-template-columns: 1fr;

  @include from(700px) {
    grid-template-columns: 2fr 1fr;
  }
}
```

`@content` is replaced by what the caller wrote between the braces. The breakpoint is defined once, and every use reads as "from 700 pixels".

## Functions

A mixin produces **declarations**. A function produces a **value**:

```scss
@use "sass:math";

@function rem($pixels) {
  @return math.div($pixels, 16px) * 1rem;
}

h1 {
  font-size: rem(32px);         // 2rem
  margin-bottom: rem(24px);     // 1.5rem
}
```

`@return` gives the result. A function is used wherever a value is expected.

## @extend and placeholders

`@extend` makes one selector share the rules of another. A **placeholder**, written with `%`, exists only to be extended and produces no CSS by itself:

```scss
%message {
  padding: 12px;
  border: 1px solid;
}

.success { @extend %message; color: green; }
.error   { @extend %message; color: red; }
```

It compiles to a **grouped selector**: `.success, .error { padding: 12px; ... }`. The CSS is smaller than with a mixin, which copies the declarations into each rule.

Prefer mixins. `@extend` moves selectors around in ways that surprise people, cannot take arguments, and does not work across media queries. Use it for a handful of closely related classes, or not at all.

## Which tool?

| You want | Use |
| --- | --- |
| a value with a name | a variable |
| a value that is calculated | a function |
| a block of declarations, perhaps with options | a mixin |
| styles wrapped around a block you pass in | a mixin with `@content` |

## Common mistakes

- **A mixin for one declaration.** A variable is enough.
- **A mixin used once.** It adds a level of indirection for nothing.
- **Expecting a function to output declarations**, or a mixin to return a value.
- **`@extend` across files and media queries.**
- **Twenty arguments on one mixin.** It is doing too much.
