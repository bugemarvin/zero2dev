---
title: HTTP and a server from scratch
summary: How browsers and servers talk, and a working server with nothing but Node.
---

## HTTP in one page

Every web page, API call and file download is an **HTTP** exchange: a client sends a **request**, a server sends back a **response**.

A request has:

- a **method**: what to do;
- a **path**: which resource, with an optional query string after `?`;
- **headers**: extra information;
- sometimes a **body**: the data being sent.

```text
POST /todos?notify=yes HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"title": "Buy milk"}
```

A response has a **status code**, headers and a body:

```text
HTTP/1.1 201 Created
Content-Type: application/json

{"id": 1, "title": "Buy milk", "done": false}
```

| Method | Meaning |
| --- | --- |
| `GET` | read. Must not change anything. |
| `POST` | create |
| `PUT`, `PATCH` | replace, or change part of |
| `DELETE` | remove |

| Status | Meaning |
| --- | --- |
| 200 OK | it worked |
| 201 Created | something new was made |
| 204 No Content | it worked, and there is nothing to send back |
| 400 Bad Request | the client sent something wrong |
| 401, 403 | not logged in, not allowed |
| 404 Not Found | no such resource |
| 500 Internal Server Error | the server has a bug |

The first digit tells the story: 2xx success, 4xx the client's mistake, 5xx the server's.

## fetch: being the client

```javascript
const response = await fetch("http://localhost:3000/todos");
if (!response.ok) {                      // ok is true for 2xx
  throw new Error(`request failed: ${response.status}`);
}
const todos = await response.json();
```

Sending data:

```javascript
const response = await fetch("http://localhost:3000/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Buy milk" }),
});
```

`fetch` only rejects when the network itself fails. A 404 or 500 is a normal response as far as `fetch` is concerned, so check `response.ok`.

## A server with node:http

```javascript
import { createServer } from "node:http";

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`listening on ${port}`));
```

- The function runs once for every request.
- `req.method` and `req.url` say what was asked.
- `new URL(...)` splits the path from the query: `url.pathname` and `url.searchParams.get("name")`.
- `res.writeHead(status, headers)` then `res.end(body)` sends the response.
- **Read the port from the `PORT` environment variable.** Whoever runs your server decides the port: a hosting platform, Docker, or the tests of this guide.

A small helper removes the repetition:

```javascript
function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
```

## Reading a request body

The body arrives in pieces. Collect them, then parse:

```javascript
async function readJson(req) {
  let text = "";
  for await (const chunk of req) {
    text += chunk;
  }
  return JSON.parse(text);
}
```

`JSON.parse` throws on invalid input. That is the client's mistake, so answer with 400, not a crash:

```javascript
let body;
try {
  body = await readJson(req);
} catch {
  sendJson(res, 400, { error: "invalid JSON" });
  return;
}
```

## Trying it

```console
$ node server.mjs
$ curl -i http://localhost:3000/health
$ curl -X POST -H "Content-Type: application/json" -d '{"a": 1}' http://localhost:3000/echo
```

In the app, **Start app** runs your server and gives you a link to open.

## Why frameworks exist

A real API has dozens of routes, and each needs the same things: matching paths with parameters, parsing bodies, handling errors. Writing that by hand with `if` statements gets repetitive quickly. The next lesson uses Express, which does it for you. Having built one without it, you will know what it is doing.

## Common mistakes

- **A hard-coded port.** Read `process.env.PORT`.
- **Forgetting `res.end()`.** The client waits for ever.
- **Always answering 200**, even for errors.
- **Not setting `Content-Type`.** Clients then do not know the body is JSON.
- **Letting an exception escape the handler**, which takes the whole server down.
