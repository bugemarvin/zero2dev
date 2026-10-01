# Change a page with the DOM

Write three exported functions in `dom.js`. The tests run them in a simulated browser.

- `renderList(container, items)` replaces whatever is inside `container` with a single `<ul>` that holds one `<li>` per item, with the item as its text. Calling it again replaces the old list. Item text must be shown **as text**, even if it looks like HTML.
- `setupCounter(button, output)` shows `0` in `output`, and adds 1 every time `button` is clicked.
- `setupFilter(input, list)` hides the `<li>` children of `list` whose text does not contain what is typed in `input`, ignoring upper and lower case. It reacts to the `input` event. Hide an element by setting its `hidden` property to `true`. An empty input shows everything.

This exercise uses the React package set, which includes the simulated browser. Download it once from Setup, or run `python3 check.py prefetch react`.
