# A theme with Sass variables

Write `style.scss` for the page in `index.html`.

Declare three variables at the top:

- `$brand` is `#1a73e8`
- `$radius` is `8px`
- `$space` is `16px`

Then use them. Do not type the values again.

- The `h1` has the colour `$brand`.
- `.button` has `background-color: $brand`, `color: white`, `border-radius: $radius` and `padding: $space`.
- `.card` has a border of `1px solid $brand`, `border-radius: $radius`, and a padding of **twice** `$space`: let Sass calculate it.

Edit the `.scss` file. **Run tests** compiles it to CSS and checks the page. **Open preview** shows the page with your compiled styles, and recompiles when you run or save.
