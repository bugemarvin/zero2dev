# Share state with context

Complete `theme.jsx`. It exports four things.

- `ThemeProvider` wraps part of the app and holds the current theme, which starts as `"light"`.
- `useTheme()` returns `{ theme, toggleTheme }` from the nearest provider. Called outside any provider, it throws an `Error` whose message is `useTheme must be used inside a ThemeProvider`.
- `ThemeButton` renders a button with the text `Theme: light` or `Theme: dark`. Clicking it switches between the two.
- `ThemedBox` renders a `<div>` whose `className` is `box light` or `box dark`, with its children inside.

Any number of `ThemeButton` and `ThemedBox` components under the same provider share one theme. Two separate providers each have their own.

Run the tests to check your component. **Start app** opens it in a browser tab.
