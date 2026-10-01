# Buttons, a breakpoint and a function

Write three reusable pieces in `style.scss`, and use them.

## A mixin `button($background)`

It sets `display: inline-block`, `padding: 8px 16px`, `border-radius: 6px`, `color: white` and `background-color: $background`.

- `.button-primary` includes it with `#1a73e8`.
- `.button-danger` includes it with `#b42318`.

## A mixin `from($width)`

It wraps the block it is given in `@media (min-width: $width)`. Use `@content`.

- `.layout` is a grid with `grid-template-columns: 1fr`.
- From `700px` it has `grid-template-columns: 2fr 1fr`. Write that with `@include from(700px) { ... }` inside `.layout`.

## A function `rem($pixels)`

It returns the size in `rem`, with 16px as the base: `rem(32px)` is `2rem`. Use `math.div`.

- The `h1` has `font-size: rem(32px)`.
- `.lead` has `font-size: rem(20px)`.

Edit the `.scss` file. **Run tests** compiles it to CSS and checks the page. **Open preview** shows the page with your compiled styles, and recompiles when you run or save.
