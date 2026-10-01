# A theme with variables

Write `style.css` for `index.html`.

- On `:root`, define three custom properties: `--brand` is `#1a73e8`, `--text` is `#222222`, `--page` is `#ffffff`.
- `body` uses them: `color: var(--text)` and `background-color: var(--page)`. Its font family ends with `sans-serif` and its `line-height` is `1.5`.
- The `h1` has `font-size: 2rem` and the colour `var(--brand)`.
- `.lead` has `font-size: 1.25rem`.
- `.small` has `font-size: 0.875rem`.
- `.button` has `background-color: var(--brand)` and the colour `var(--page)`.

The tests follow your variables: `color: var(--brand)` counts as `#1a73e8`.

The tests read your CSS as it is written. Use the property names given here: for example `background-color`, not the `background` shorthand with several values.
