# A brand colour and a display font

Two files to edit.

## `input.css`

Below the import, add an `@theme` block with:

- the colour `--color-brand` as `#1a73e8`;
- the font `--font-display` as `Georgia, serif`.

## `index.html`

Use what the theme now gives you. Do not use `bg-blue-600` or bracket colours for the brand.

- The `h1` has the classes `font-display` and `text-brand`.
- The `button` has `bg-brand` and `text-white`.
- The `main` has a width that is on no scale: exactly 640 pixels at most. Write it as an arbitrary value, `max-w-[640px]`, and centre it with `mx-auto`.

**Run tests** builds the CSS with Tailwind and checks the classes on the page. **Open preview** shows the styled page, and builds again when you run or save.
