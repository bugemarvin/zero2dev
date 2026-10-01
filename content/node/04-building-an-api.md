---
title: Building a solid API
summary: Middleware, validation, consistent errors, filtering and paging: what separates a demo from a service.
---

The JavaScript track introduced [Express](js/08-express-api): routes, `req`, `res`, JSON. This lesson is about building an API that other people can depend on.

## Middleware

A **middleware** is a function that runs for a request before, or in place of, the route handler:

```javascript
function logRequests(req, res, next) {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();             // pass the request on
}

app.use(express.json());      // parses JSON bodies into req.body
app.use(logRequests);
```

A request passes through the middleware **in the order they were added**. Each one calls `next()` to continue, or sends a response to stop. Authentication, logging, rate limits and body parsing are all middleware.

## Routers

Group the routes of one resource in a router, in its own file:

```javascript
// routes/books.mjs
import { Router } from "express";

export const books = Router();

books.get("/", (req, res) => { /* list */ });
books.get("/:id", (req, res) => { /* one */ });
books.post("/", (req, res) => { /* create */ });
```

```javascript
app.use("/books", books);
```

## Validation

Never use input you have not checked. Validate at the edge, and reject with **400** and a message that says what is wrong:

```javascript
function validateBook(body) {
  const errors = {};
  if (typeof body.title !== "string" || body.title.trim() === "") {
    errors.title = "title is required";
  }
  if (!Number.isInteger(body.year) || body.year < 0) {
    errors.year = "year must be a positive whole number";
  }
  return errors;
}

books.post("/", (req, res) => {
  const errors = validateBook(req.body ?? {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "validation failed", fields: errors });
  }
  // ...
});
```

Report **all** the problems at once, per field. A form can then show each message next to its field. In real projects a schema library such as Zod does this, and also gives you the TypeScript types.

Copy only the fields you expect. `Object.assign(book, req.body)` lets a client set `id`, `ownerId` or `isAdmin`. That is **mass assignment**.

## One shape for every error

Clients need to handle errors with one piece of code. Pick a shape and use it everywhere:

```json
{ "error": "not found" }
```

Throw errors that carry their status, and turn them into responses in **one** place:

```javascript
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

books.get("/:id", (req, res) => {
  const book = store.find(Number(req.params.id));
  if (!book) {
    throw new HttpError(404, "not found");
  }
  res.json(book);
});
```

The **error handler** is a middleware with four parameters, added last:

```javascript
app.use((req, res) => {
  res.status(404).json({ error: "not found" });        // no route matched
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {           // express.json() met invalid JSON
    return res.status(400).json({ error: "invalid JSON" });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);                                 // a bug: log it, hide the details
  res.status(500).json({ error: "internal error" });
});
```

Never send a stack trace or a database message to the client. It tells an attacker how your system is built. Express 5 passes errors from `async` handlers to this function automatically.

## Status codes that mean something

| Code | Use |
| --- | --- |
| 200 | success with a body |
| 201 | created. Add a `Location` header with the new address. |
| 204 | success, no body |
| 400 | the request is malformed or fails validation |
| 401 | not authenticated: who are you? |
| 403 | authenticated, and not allowed |
| 404 | no such resource |
| 409 | conflict with the current state: a duplicate |
| 422 | well-formed, and semantically wrong (some APIs use it for validation) |
| 429 | too many requests |
| 500 | a bug on the server |

## Filtering, sorting, paging

A list endpoint must never return "everything". It will have a million rows one day.

```text
GET /books?author=austen&sort=-year&limit=20&offset=40
```

```javascript
const limit = Math.min(Number(req.query.limit) || 20, 100);     // a default and a maximum
const offset = Math.max(Number(req.query.offset) || 0, 0);
```

Return the page together with what the client needs to ask for the next one:

```json
{ "items": [], "total": 137, "limit": 20, "offset": 40 }
```

Query values are always **strings**. Convert and check them like any other input.

## Idempotency

`GET`, `PUT` and `DELETE` should give the same result when repeated: a client that got no answer can safely try again. `POST` creates something new each time, so a retried payment can charge twice. Real APIs accept an `Idempotency-Key` header and remember the outcome per key.

## Common mistakes

- **No validation**, or validation scattered through the handlers.
- **A different error shape in every route.**
- **200 with `{ "error": ... }`** in the body. The status code is the first thing a client looks at.
- **Unbounded lists.**
- **Leaking internal errors** to the client.
- **Trusting `req.body` enough to store it as it is.**
