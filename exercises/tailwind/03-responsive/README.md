# A page that adapts, and a button that reacts

Add classes in `index.html`. Design for the phone first, then add what changes on wider screens. Do not write any CSS.

- The `nav` is hidden on a phone, and a flex row from the `md` breakpoint: `hidden` and `md:flex`.
- The `h1` is `text-2xl`, and `text-4xl` from `md`.
- The element with the id `cards` is a `grid` with a `gap-4`: one column on a phone (`grid-cols-1`), two from `md`, four from `lg`.
- The `button` has the background `bg-blue-600` and white text (`text-white`). On hover the background is `bg-blue-700`. With keyboard focus it shows `outline-2`: use `focus-visible:` (or `focus:`).
- The `body` is `bg-white`, and `bg-gray-900` in dark mode.

**Run tests** builds the CSS with Tailwind and checks the classes on the page. **Open preview** shows the styled page, and builds again when you run or save.
