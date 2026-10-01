# A books API with validation and paging

Finish `server.mjs`. The store, the `HttpError` class and the three starting books are given.

## Routes

| Request | Answer |
| --- | --- |
| `GET /books` | 200 and a page: `{ "items": [...], "total": N, "limit": L, "offset": O }` |
| `GET /books/:id` | 200 and the book, or 404 |
| `POST /books` | 201, the new book, and the header `Location: /books/ID` |
| `DELETE /books/:id` | 204, or 404 |

## The list

- `?author=NAME` keeps the books of that author, ignoring upper and lower case.
- `?sort=year` orders by year, oldest first. `?sort=-year` newest first. Without `sort`, the order is by id.
- `?limit=N` is the page size: 20 by default, at least 1, at most 100.
- `?offset=N` skips that many books: 0 by default, never negative.
- `total` is the number of books after filtering and before paging.

## Creating

The body needs `title` (non-empty text), `author` (non-empty text) and `year` (a whole number). Title and author are trimmed. Any other field in the body is ignored, including `id`.

When the body is wrong, answer 400 with every problem at once:

```json
{ "error": "validation failed", "fields": { "title": "title is required", "year": "year must be a whole number" } }
```

The messages are `title is required`, `author is required` and `year must be a whole number`.

## Errors

Every error has the shape `{ "error": "..." }`:

- an unknown book or an unknown path: 404 and `not found`
- a body that is not valid JSON: 400 and `invalid JSON`
