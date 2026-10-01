---
title: Services that call each other
summary: One service needs data that another one owns. Make the call, and handle everything that can go wrong with it.
---

## A request across the network

The orders service knows that order 7 belongs to user 3. The user's name lives in the users service. To answer "show order 7 with the customer's name", orders must ask users:

```text
client --> GET /orders/7 --> [orders] --> GET /users/3 --> [users]
                                      <-- {"id": 3, "name": "Ada"}
       <-- {"id": 7, "item": "Book", "user": {"id": 3, "name": "Ada"}}
```

This is **synchronous** communication over HTTP: the caller waits for the answer.

## Where is the other service?

Never write another service's address into the code. It differs between your machine, the test system and production. Read it from the environment:

```javascript
const USERS_URL = process.env.USERS_URL ?? "http://localhost:3001";
```

In Compose, the address is the **service name**:

```yaml
services:
  orders:
    build: ./orders
    environment:
      USERS_URL: http://users:3000
    ports:
      - "127.0.0.1:${PORT}:3000"

  users:
    build: ./users
```

`users` is reachable from `orders` as `http://users:3000`. It has no published port: nothing outside the system needs to reach it directly.

## Making the call

```javascript
async function getUser(id) {
  const response = await fetch(`${USERS_URL}/users/${id}`);
  if (response.status === 404) {
    return null;                       // a legitimate answer: there is no such user
  }
  if (!response.ok) {
    throw new Error(`users service answered ${response.status}`);
  }
  return response.json();
}
```

Three outcomes, each handled on purpose:

| Outcome | Meaning | What to do |
| --- | --- | --- |
| 200 | here is the data | use it |
| 404 | no such thing | a normal result: often `null` |
| 5xx, or no answer at all | the other service is in trouble | an error. Decide what your service does without it. |

## Putting it in a handler

```javascript
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
  const match = req.url.match(/^\/orders\/(\d+)$/);
  if (req.method === "GET" && match) {
    const order = orders.find((o) => o.id === Number(match[1]));
    if (!order) {
      return sendJson(res, 404, { error: "order not found" });
    }
    try {
      const user = await getUser(order.userId);
      return sendJson(res, 200, { id: order.id, item: order.item, user });
    } catch (error) {
      return sendJson(res, 502, { error: "users service unavailable" });
    }
  }
  sendJson(res, 404, { error: "not found" });
});
```

Status **502 Bad Gateway** means: I am fine, but a service I depend on is not. It tells whoever reads the logs where to look.

## Every service has a health endpoint

```javascript
if (req.method === "GET" && req.url === "/health") {
  return sendJson(res, 200, { status: "ok" });
}
```

Orchestrators, load balancers and other services use it to see whether this one is alive. Keep it cheap, and do not make it depend on other services, or one failure takes everything down with it.

## Do not chain too deep

If A calls B, which calls C, which calls D, then:

- the response time is the sum of all four;
- A fails when **any** of them fails. Four services that are each up 99.9% of the time give a chain that is up 99.6%.

Keep call chains short. If a service constantly needs data from another one to do anything at all, they may belong together.

## Contracts

The JSON a service returns is a **contract**. Other services are written against it, and they are deployed separately from yours.

- **Adding** a field is safe.
- **Removing or renaming** a field, or changing its type, breaks every caller.
- When a breaking change is unavoidable, offer the new form next to the old one, for example under `/v2/`, until the callers have moved.

## Running and inspecting

```console
$ PORT=8080 docker compose up -d --build
$ curl http://127.0.0.1:8080/orders/1
$ docker compose logs -f orders
$ docker compose exec orders node -e "fetch('http://users:3000/users/1').then(r => r.json()).then(console.log)"
$ docker compose down
```

The last but one line tests the connection from **inside** the orders container, which is the quickest way to tell a networking problem from a bug in your code.

## Common mistakes

- **A hard-coded address**, or `localhost`, for another service.
- **Treating a 404 as a crash.** It is an answer.
- **No error handling around the call**, so one failing service returns a 500 with a stack trace from another.
- **Publishing every service's port.**
- **A health check that calls other services.**
