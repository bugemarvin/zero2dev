# Tokens in their own file

Two files to edit.

## `_tokens.scss`

Declare three variables:

- `$brand` is `#1a73e8`
- `$text` is `#222222`
- `$space` is `16px`

## `style.scss`

- Load the tokens with `@use`. Do not use `@import`.
- `body` has the colour `tokens.$text`.
- `h1` has the colour `tokens.$brand` and a bottom margin of `tokens.$space`.
- `.button` has `background-color: tokens.$brand`, `color: white`, and a padding of half the space top and bottom and the full space left and right. Calculate the half with `math.div` from the built-in module `sass:math`.

`style.scss` must not contain the colour values themselves: they live in the tokens file.

Edit the `.scss` file. **Run tests** compiles it to CSS and checks the page. **Open preview** shows the page with your compiled styles, and recompiles when you run or save.
