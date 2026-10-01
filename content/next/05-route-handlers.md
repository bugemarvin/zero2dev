---
title: Route handlers
summary: API endpoints inside your Next.js project, written with the web's own Request and Response.
---

## route.js

A file named `route.js` in the `app` directory defines an API endpoint. It exports one function per HTTP method:

```javascript
// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: "Hello" });
}
```

`GET /api/hello` now answers with JSON. A folder contains either a `page.js` or a `route.js`, not both.

The functions receive a standard `Request` and return a standard `Response`. These are the same objects `fetch` uses in the browser, so there is nothing framework-specific to learn.

## Reading the request

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "world";
  return Response.json({ message: `Hello, ${name}!` });
}

export async function POST(request) {
  const body = await request.json();
  return Response.json({ received: body }, { status: 201 });
}
```

| What | How |
| --- | --- |
| query string | `new URL(request.url).searchParams.get("name")` |
| JSON body | `await request.json()` |
| form data | `await request.formData()` |
| a header | `request.headers.get("authorization")` |

## Status codes and errors

The second argument of `Response.json` sets the status:

```javascript
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (typeof body.text !== "string" || body.text.trim() === "") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }
  const note = addNote(body.text.trim());
  return Response.json(note, { status: 201 });
}
```

A response with no body:

```javascript
return new Response(null, { status: 204 });
```

The conventions from the [Express lesson](js/08-express-api) apply unchanged: 201 for created, 204 for deleted, 400 for bad input, 404 for not found.

## Dynamic segments

A handler in a `[id]` folder receives the parameters as its second argument. As in pages, `params` is a promise:

```javascript
// app/api/notes/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  const note = getNote(Number(id));
  if (!note) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(note);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!deleteNote(Number(id))) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
```

A method that the file does not export gets the answer `405 Method Not Allowed` automatically.

## Keeping the logic out of the handler

Put the data handling in a plain module and keep the handler thin: read the input, validate, call the module, shape the response.

```javascript
// lib/notes.js
const store = (globalThis.notesStore ??= { notes: [], nextId: 1 });

export function listNotes() {
  return store.notes;
}

export function addNote(text) {
  const note = { id: store.nextId++, text };
  store.notes.push(note);
  return note;
}
```

Keeping the data on `globalThis` makes it survive the reloading that the development server does when files change. It is a stand-in for a database. Real data belongs in one, such as [PostgreSQL](sql/01-select).

## Do you need an API at all?

In a Next.js app, often not.

- A **page** that needs data reads it directly in a server component. No endpoint, no `fetch`.
- A **form** that changes data calls a server action, which lesson 7 covers.

Write route handlers when something **other than your own pages** needs the data: a mobile app, another service, a webhook from a payment provider, or a client component that polls.

## Common mistakes

- **Forgetting `await`** on `request.json()` or `params`.
- **Returning a plain object.** A handler must return a `Response`.
- **`page.js` and `route.js` in the same folder.**
- **Fetching your own route handler from a server component.** Call the function in `lib/` directly.
- **200 for every outcome.**
