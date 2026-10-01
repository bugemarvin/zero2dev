# Buttons with @apply

The three buttons in `index.html` repeat the same long list of classes. Give that list a name.

## `input.css`

Inside `@layer components`, write two classes with `@apply`:

- `.btn` applies `px-4`, `py-2`, `rounded-md` and `font-semibold`;
- `.btn-primary` applies `bg-blue-600`, `text-white` and `hover:bg-blue-700`.

## `index.html`

- Every button has the classes `btn` and `btn-primary`, and no longer the utilities those two contain.
- The last button, with the id `wide`, is wider than the others: keep the utility `px-8` on it, next to `btn`. Because `.btn` is in the components layer, the utility wins.

**Run tests** builds the CSS with Tailwind and checks the classes on the page. **Open preview** shows the styled page, and builds again when you run or save.
