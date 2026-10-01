# Or, in and distinct

Use the same `books` collection. Set `result` to a document with three fields:

```javascript
const result = {
  cheapOrNew: ...,
  austenTitles: ...,
  tags: ...,
};
```

- `cheapOrNew`: the **number** of books that cost less than 8 **or** were published after 2000.
- `austenTitles`: the titles of the books whose author is in the list `["Jane Austen", "Andy Weir"]`, as an array of strings sorted alphabetically. `find(...).toArray()` gives an array of documents, and `.map(book => book.title)` turns it into titles.
- `tags`: all the distinct tags, sorted alphabetically.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
