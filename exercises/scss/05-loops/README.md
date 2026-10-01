# Utility classes from a map and a loop

Generate classes in `style.scss`. The page already uses them.

## Colours, with a map and `@each`

Declare the map `$colors` with three entries: `primary` is `#1a73e8`, `danger` is `#b42318`, `success` is `#15803d`.

For every entry, generate two classes:

- `.text-NAME` with that `color`;
- `.bg-NAME` with that `background-color`.

## Spacing, with `@for`

Generate `.mt-1` to `.mt-4`, where `.mt-N` has a `margin-top` of N times `4px`: 4px, 8px, 12px, 16px.

Your file must not contain the class names written out, such as `.text-danger` or `.mt-3`. Build them with interpolation: `#{$name}` and `#{$i}`.

Edit the `.scss` file. **Run tests** compiles it to CSS and checks the page. **Open preview** shows the page with your compiled styles, and recompiles when you run or save.
