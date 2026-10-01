# Load data from a server

Complete `UserList.jsx`.

`<UserList url="/api/users" />` fetches the URL when it appears, and expects a JSON array of users such as `{ "id": 1, "name": "Ada" }`.

| Situation | It shows |
| --- | --- |
| while the request is running | a `<p>` with `Loading...` |
| the request failed, or the status was not 2xx | an element with `role="alert"` and the text `Could not load users.` |
| an empty array came back | a `<p>` with `No users yet.` |
| users came back | a `<ul>` with one `<li>` per user, showing the name |

When the `url` prop changes, it shows `Loading...` again and fetches the new URL.

The tests replace `fetch` with a fake, so no server is needed. For **Start app**, the preview page supplies sample data in the same way.

Run the tests to check your component. **Start app** opens it in a browser tab.
