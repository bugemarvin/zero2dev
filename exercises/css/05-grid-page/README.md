# A page layout and a card grid

Edit only `style.css`.

## The page

`.page` is a grid with two columns, `200px` and `1fr`, a `gap` of `1rem`, and these areas:

```text
header  header
sidebar main
footer  footer
```

Give the four children their area with `grid-area`: the `header` gets `header`, the `aside` gets `sidebar`, the `main` gets `main` and the `footer` gets `footer`.

## The cards

- `.cards` is a grid with three equal columns: `repeat(3, 1fr)`, and a `gap` of `1rem`.
- `.featured` spans two columns: `grid-column: span 2`.

The tests read your CSS as it is written. Use the property names given here: for example `background-color`, not the `background` shorthand with several values.
