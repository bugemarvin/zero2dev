# Mobile first

Write `style.css` mobile first: base rules for a small screen, then one media query for wide screens.

## Base rules (small screens)

- `img` has `max-width: 100%` and `height: auto`.
- `.layout` is a grid with a single column: `grid-template-columns: 1fr`, and a `gap` of `1rem`.
- `.links` is a flex container with `flex-direction: column`.

## From 700px up

Inside `@media (min-width: 700px)`:

- `.layout` has the columns `2fr 1fr`.
- `.links` has `flex-direction: row`.

**Open preview** and change the width of the window to see both layouts.

The tests read your CSS as it is written. Use the property names given here: for example `background-color`, not the `background` shorthand with several values.
