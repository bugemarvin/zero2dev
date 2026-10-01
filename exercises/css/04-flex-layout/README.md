# A header, a hero and a sidebar with flexbox

Lay out `index.html` with flexbox. Edit only `style.css`.

- `.header` is a flex container. The logo sits on the left and the links on the right: `justify-content: space-between`. They are vertically centred: `align-items: center`.
- `.links` is a flex container with a `gap` of `1rem`.
- `.hero` centres its heading both ways: flex, `justify-content: center`, `align-items: center`, and `min-height: 50vh`.
- `.layout` is a flex container with a `gap` of `2rem`.
- `.sidebar` never grows or shrinks and is 240px wide: `flex: 0 0 240px`.
- `.content` takes the remaining space: `flex: 1`.

The tests read your CSS as it is written. Use the property names given here: for example `background-color`, not the `background` shorthand with several values.
