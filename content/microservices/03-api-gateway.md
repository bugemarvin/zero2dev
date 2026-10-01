---
title: The API gateway
summary: One front door for all the services, so that clients do not need to know how the system is split.
---

## The problem

A system has a users service, an orders service and a catalogue service. If a web or mobile client talks to each of them directly:

- the client must know every address;
- every service must be reachable from the internet;
- logging in, rate limiting and CORS have to be implemented in each one;
- splitting or merging services breaks the clients.

## The gateway

An **API gateway** is one service that faces the outside world and forwards each request to the service behind it that handles it.

```text
                     +--> /api/users/*   --> [users]
client --> [gateway] +
                     +--> /api/orders/*  --> [orders]
```

Clients know one address. The services behind it are private, and can be rearranged without anyone outside noticing.

## Routing

At its heart a gateway is a routing table: a path prefix and where it leads.

```javascript
const routes = [
  { prefix: "/api/users", target: process.env.USERS_URL },
  { prefix: "/api/orders", target: process.env.ORDERS_URL },
];

function findRoute(path) {
  return routes.find((route) => path === route.prefix || path.startsWith(route.prefix + "/"));
}
```

The check for the slash matters. Without it, `/api/usersettings` would match the prefix `/api/users`.

## Forwarding

The gateway makes the same request to the service, and hands the answer back unchanged: same status, same body.

```javascript
async function forward(req, res, route) {
  const path = req.url.slice("/api".length);              // /api/users/3 becomes /users/3
  let upstream;
  try {
    upstream = await fetch(route.target + path, { method: req.method });
  } catch (error) {
    return sendJson(res, 502, { error: "service unavailable" });
  }
  const body = await upstream.text();
  res.writeHead(upstream.status, { "Content-Type": upstream.headers.get("content-type") ?? "application/json" });
  res.end(body);
}
```

- A 404 from the service goes back to the client as a 404. The gateway does not interpret it.
- If the service **cannot be reached**, the gateway answers 502.
- A path that matches no route is the gateway's own 404.

A complete gateway also forwards the request body and the relevant headers. This one handles `GET`, which is enough to see the principle.

## What else belongs in a gateway

Things that every request needs, done once:

| Concern | What the gateway does |
| --- | --- |
| authentication | checks the token, and passes the user's identity on to the services |
| rate limiting | refuses clients that send too many requests |
| TLS | handles HTTPS, so the services inside can speak plain HTTP |
| CORS | answers the browser's cross-origin checks |
| logging | records every request in one place, with one request id |

In production you would rarely write one yourself. Nginx, Traefik, Kong and the gateways of cloud providers do this job. Writing a small one teaches what they do.

## Aggregated health

The gateway is a natural place to ask "is the whole system up?":

```javascript
async function check(url) {
  try {
    const response = await fetch(url + "/health");
    return response.ok ? "ok" : "down";
  } catch {
    return "down";
  }
}

const [users, orders] = await Promise.all([check(USERS_URL), check(ORDERS_URL)]);
const allOk = users === "ok" && orders === "ok";
sendJson(res, allOk ? 200 : 503, { status: allOk ? "ok" : "degraded", services: { users, orders } });
```

`Promise.all` asks both at the same time. A status of 503 lets monitoring tools notice without parsing the body.

## Keep business logic out

A gateway routes. It should not know what an order is. Once it starts combining data and applying rules, it becomes a service that every team has to change, and the bottleneck that microservices were meant to remove.

When a client needs data combined from several services, that belongs in a dedicated service, sometimes called a **backend for frontend**.

## Only the gateway is published

```yaml
services:
  gateway:
    build: ./gateway
    environment:
      USERS_URL: http://users:3000
      ORDERS_URL: http://orders:3000
    ports:
      - "127.0.0.1:${PORT}:3000"

  users:
    build: ./users

  orders:
    build: ./orders
    environment:
      USERS_URL: http://users:3000
```

## Common mistakes

- **Prefix matching without the slash check.**
- **Turning every upstream problem into a 500.** Pass the service's status through, and use 502 for "could not reach it".
- **Business logic in the gateway.**
- **A gateway that is the only copy of itself.** Everything goes through it, so in production it must run more than once.
- **Leaving the internal services reachable** from outside as well.
