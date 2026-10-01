---
title: Maps, loops and conditions
summary: Generate families of classes from data, and decide with @if.
---

## Maps

A **map** holds values under names:

```scss
$colors: (
  "primary": #1a73e8,
  "danger": #b42318,
  "success": #15803d,
);
```

Read one with `map.get` from the built-in module:

```scss
@use "sass:map";

.alert {
  color: map.get($colors, "danger");
}
```

A map is the right shape for **design tokens**: the set of colours, the spacing steps, the breakpoints.

## @each

`@each` runs a block once for every item of a list or a map:

```scss
@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
}
```

It compiles to `.text-primary`, `.text-danger` and `.text-success`. Add a colour to the map, and its class exists.

`#{$name}` is **interpolation**: it puts the value of a variable into a selector, a property name, or a string. Without it, `.text-$name` would be taken as plain text.

Over a list:

```scss
@each $side in top, right, bottom, left {
  .border-#{$side} {
    border-#{$side}: 1px solid #cccccc;
  }
}
```

## @for

`@for` counts:

```scss
@for $i from 1 through 4 {
  .mt-#{$i} {
    margin-top: $i * 4px;
  }
}
```

That gives `.mt-1` with 4px up to `.mt-4` with 16px. `through` includes the last number. `to` stops before it.

## @if

```scss
@mixin theme($mode) {
  @if $mode == dark {
    background: #111111;
    color: #eeeeee;
  } @else if $mode == light {
    background: #ffffff;
    color: #222222;
  } @else {
    @error "Unknown mode: #{$mode}";
  }
}
```

`@error` stops the compile with your message. Use it in mixins and functions to catch wrong arguments early. `@warn` prints a message and carries on. `@debug` prints a value while you are working something out.

## Breakpoints from a map

Loops and maps together remove a great deal of repetition:

```scss
@use "sass:map";

$breakpoints: ("small": 480px, "medium": 768px, "large": 1100px);

@mixin from($name) {
  @media (min-width: map.get($breakpoints, $name)) {
    @content;
  }
}

.sidebar {
  @include from("medium") {
    width: 240px;
  }
}
```

## Generate with care

A loop over ten colours, six properties and four breakpoints produces 240 classes, and your page uses eleven of them. Every generated class is shipped to every visitor. Generate what you use.

That idea, taken to its end with a tool that removes what is unused, is what utility frameworks such as Tailwind do.

## What plain CSS has caught up on

CSS now has custom properties, nesting, `calc()`, and colour functions. Sass still gives you what CSS has not: mixins, functions, loops, maps, and splitting into modules at build time. Many projects use both: Sass for structure and generation, custom properties for values that change at run time.

## Common mistakes

- **Forgetting `#{ }`** in a selector or a property name.
- **`to` where `through` was meant**, and one class too few.
- **Generating hundreds of unused classes.**
- **A map key that does not exist**: `map.get` returns `null`, and the declaration silently disappears.
- **Logic so clever** that nobody can tell what CSS comes out. Look at the compiled file now and then.
