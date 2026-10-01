# A stopwatch and the page title

Complete the two components in `Timer.jsx`.

## `DocumentTitle`

`<DocumentTitle title="Inbox" />` sets `document.title` to the title, and updates it whenever the prop changes. It renders nothing: return `null`.

## `Stopwatch`

- It shows a `<p>` with `0 seconds`, and a button `Start`.
- Clicking `Start` begins counting: the number goes up by one every second, and the button now says `Stop`.
- Clicking `Stop` pauses. The number stays where it is, and the button says `Start` again.
- One second shows as `1 second`, every other number as `N seconds`.
- When the component is removed from the page while running, its timer must be cleared.

Use `setInterval` inside an effect that depends on whether the stopwatch is running, and return a cleanup function.

Run the tests to check your component. **Start app** opens it in a browser tab.
