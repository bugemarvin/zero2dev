# Props, conditions and children

Complete the two components in `UserCard.jsx`.

## `Card`

`<Card title="Team">...</Card>` renders a `<section>` with the class `card`, containing an `<h2>` with the title, followed by whatever was placed between its tags.

## `UserCard`

`<UserCard user={user} />`, where a user looks like `{ name: "Ada", role: "Engineer", admin: true, online: false }`.

It renders a `Card` whose title is the user's name. Inside:

- a `<p>` with the role;
- a `<span>` with the class `badge` and the text `Admin`, **only if** `user.admin` is true;
- a `<p>` with the text `Online` or `Offline`.

If the user has no role, show `No role` in its place.

Run the tests to check your component. **Start app** opens it in a browser tab.
