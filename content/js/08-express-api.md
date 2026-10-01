---
title: A REST API with Express
summary: Routes, parameters, JSON bodies and proper status codes, in the most widely used Node framework.
---

## Express

Express is a small framework that handles the plumbing of an HTTP server.

```javascript
import express from "express";

const app = express();
app.use(express.json());                 // parse JSON request bodies into req.body

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
```

`res.json(data)` sets the content type, converts to JSON and sends, with status 200 unless you say otherwise.

Express is a package, so it has to be installed. In this guide it comes from the Node package set: open Setup in the app and download it once, or run `python3 check.py prefetch node`.

## Routes

A route is a method, a path and a handler:

```javascript
app.get("/todos", (req, res) => { ... });
app.post("/todos", (req, res) => { ... });
app.get("/todos/:id", (req, res) => { ... });
app.patch("/todos/:id", (req, res) => { ... });
app.delete("/todos/:id", (req, res) => { ... });
```

| In the request | Read it from |
| --- | --- |
| a `:name` part of the path | `req.params.name` |
| `?page=2` in the URL | `req.query.page` |
| the JSON body | `req.body` |
| a header | `req.get("Authorization")` |

Path parameters and query values are **strings**. Convert them: `Number(req.params.id)`.

## REST

REST is a set of conventions for designing an API around **resources**, the things your system manages:

| Action | Method and path | Success |
| --- | --- | --- |
| list all | `GET /todos` | 200 and an array |
| read one | `GET /todos/1` | 200 and the object |
| create | `POST /todos` | 201 and the new object |
| change | `PATCH /todos/1` | 200 and the updated object |
| delete | `DELETE /todos/1` | 204 and no body |

Paths name things, with plural nouns. The method says what to do with them. Avoid paths like `/getTodos` or `/deleteTodo`.

## A complete resource

```javascript
let todos = [];
let nextId = 1;

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const title = req.body?.title;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }
  const todo = { id: nextId++, title: title.trim(), done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const before = todos.length;
  todos = todos.filter((t) => t.id !== Number(req.params.id));
  if (todos.length === before) {
    return res.status(404).json({ error: "not found" });
  }
  res.status(204).end();
});
```

Notice the pattern in every handler: **validate, and leave early with a 4xx when something is wrong**. Then do the work, then respond. The `return` matters: without it the code carries on and tries to send a second response.

This example keeps the data in memory, so it is gone when the server restarts. A real API stores it in a database, which the [SQL track](sql/01-select) covers.

## Middleware

A **middleware** is a function that runs before the route handlers. It can inspect or change the request, answer it, or pass it on with `next()`.

```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

`express.json()` is a middleware too. They run in the order they were added.

A handler for unknown routes goes after all the routes, and an error handler, recognised by its four parameters, goes last:

```javascript
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: "something went wrong" });
});
```

If a client sends invalid JSON, `express.json()` raises an error with `status` 400, and this handler answers with it.

## Never trust the client

Everything in `req.body`, `req.params` and `req.query` comes from outside. Check the type and the range of each value before you use it. An API that crashes, or stores nonsense, when given odd input has a bug.

## Common mistakes

- **Forgetting `express.json()`.** `req.body` is then `undefined`.
- **Forgetting `return`** after sending an error response.
- **Comparing `req.params.id` with a number** without converting it.
- **200 for everything.** Use 201, 204, 400 and 404 where they apply.
- **Verbs in paths.**
