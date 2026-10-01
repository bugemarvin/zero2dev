# A service with injected dependencies

Write `createLibrary(deps)` in `solution.mjs`. It contains the rules of a small library and knows nothing about HTTP or databases.

`deps` is an object with:

- `books`: a repository with the async methods `findById(id)` (a book or `null`), and `save(book)`
- `clock`: a function that returns the current time in milliseconds
- `notify`: an async function `notify(memberId, message)`

A book looks like `{ id, title, borrowedBy, dueAt }`. A free book has `borrowedBy: null` and `dueAt: null`.

`createLibrary` returns an object with three async methods.

## `borrow(bookId, memberId)`

- An unknown book throws an `Error` with the message `book not found`.
- A book that is already borrowed throws `book is already borrowed`.
- Otherwise it sets `borrowedBy` to the member and `dueAt` to **14 days** after `clock()`, saves the book with `books.save`, and returns the saved book.

## `giveBack(bookId, memberId)`

- An unknown book throws `book not found`.
- A book that this member has not borrowed throws `not borrowed by this member`.
- Otherwise it clears `borrowedBy` and `dueAt`, saves, and returns `{ late: false, fee: 0 }` when it is on time. When `clock()` is later than `dueAt`, it returns `{ late: true, fee }`, where the fee is **50 per started day** of delay, and it calls `notify(memberId, "late fee: FEE")`.

## `isAvailable(bookId)`

Returns `true` when the book exists and is not borrowed, otherwise `false`.

Do not use `Date.now()` in your code. The time comes from `clock`, which is what lets the tests travel in time.
