# A navigation bar and a card, nested

Write `style.scss` with **two** top-level rules, `.nav` and `.card`, and nest everything else inside them.

## `.nav`

- `.nav` itself is `display: flex` with a `gap` of `1rem`.
- Links inside it have the colour `#333333` and `text-decoration: none`.
- A hovered link has `text-decoration: underline`. Use `&:hover`.
- A link with the class `active` has `font-weight: bold`. Use `&.active`.

## `.card` (BEM names)

- `.card` has `padding: 16px` and a border of `1px solid #cccccc`.
- `.card__title` has `font-size: 1.25rem`. Write it as `&__title`.
- `.card--featured` has `border-color: gold`. Write it as `&--featured`.

In your file, `.nav a`, `.card__title` and `.card--featured` must not be written out: nest them.

Edit the `.scss` file. **Run tests** compiles it to CSS and checks the page. **Open preview** shows the page with your compiled styles, and recompiles when you run or save.
