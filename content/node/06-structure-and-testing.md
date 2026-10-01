---
title: Structure and testing
summary: Arrange a backend in layers, pass dependencies in, and test each part without a server or a database.
---

## The problem with one big file

A route handler that parses input, applies business rules, runs SQL and formats the response works. It cannot be tested without starting the server and a database, and every change risks breaking something unrelated.

## Layers

Split the work into three kinds of code:

| Layer | Knows about | Example |
| --- | --- | --- |
| **routes** (or controllers) | HTTP: requests, status codes, JSON | `routes/orders.mjs` |
| **services** | the rules of your business. No HTTP, no SQL. | `services/orders.mjs` |
| **repositories** | where the data lives: SQL, MongoDB, files | `repositories/orders.mjs` |

```text
src/
  app.mjs               builds the Express app
  server.mjs            reads the configuration and starts listening
  routes/
  services/
  repositories/
test/
```

A request goes down the layers, and the answer comes back up. Each layer talks only to the one below it.

## Dependency injection

A service must not create its own database connection. It **receives** what it needs:

```javascript
export function createOrderService({ orders, clock = () => new Date() }) {
  return {
    async place(customerId, lines) {
      if (lines.length === 0) {
        throw new Error("an order needs at least one line");
      }
      const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
      return orders.insert({ customerId, lines, total, placedAt: clock() });
    },
  };
}
```

In production you pass the real repository. In a test you pass a **fake**:

```javascript
const saved = [];
const service = createOrderService({
  orders: { insert: async (order) => { saved.push(order); return { id: 1, ...order }; } },
  clock: () => new Date("2025-01-01T00:00:00Z"),
});
```

The test runs in a millisecond, needs no database, and controls the time. Anything a function depends on that is slow, random or outside the program should arrive as a parameter: the database, the network, the clock, the random generator.

## The built-in test runner

```javascript
import test from "node:test";
import assert from "node:assert/strict";

test("an order needs at least one line", async () => {
  const service = createOrderService({ orders: { insert: async () => ({}) } });
  await assert.rejects(() => service.place(1, []), { message: "an order needs at least one line" });
});
```

```console
$ node --test
$ node --test --watch
$ node --test --experimental-test-coverage
```

| Assertion | Checks |
| --- | --- |
| `assert.equal(a, b)` | the same value (strict) |
| `assert.deepEqual(a, b)` | the same structure, for objects and arrays |
| `assert.ok(value)` | truthy |
| `assert.throws(fn, expected)` | a synchronous function throws |
| `assert.rejects(fn, expected)` | an async function rejects |

`test.beforeEach` prepares fresh state for every test. The `mock` object of `node:test` creates functions that record their calls: `mock.fn()`.

## Which tests?

| Kind | Tests | Speed | How many |
| --- | --- | --- | --- |
| unit | one function or service, with fakes | milliseconds | most |
| integration | several parts together, with a real database | slower | some |
| end to end | the running system through HTTP | slowest | a few |

Test **behaviour**, not implementation: what goes in and what comes out. A test that breaks whenever you rename a private function is a burden.

A good test has three parts: **arrange** the situation, **act** once, **assert** the result.

## Separate the app from the server

```javascript
// app.mjs
export function createApp(deps) {
  const app = express();
  app.use(express.json());
  app.use("/orders", ordersRouter(deps));
  return app;
}

// server.mjs
const app = createApp({ orders: createOrderService({ orders: realRepository }) });
const server = app.listen(config.port);
```

Tests can now build the app with fakes and call it without a fixed port.

## Shutting down cleanly

A deployment sends `SIGTERM` and then waits a little before killing the process. Finish what you are doing:

```javascript
process.on("SIGTERM", () => {
  server.close(() => {            // stop accepting, let running requests finish
    database.end();
    process.exit(0);
  });
});
```

Without this, every deployment drops the requests that were in flight.

## Logging

- Write logs to **standard output**, one event per line. The platform collects them.
- Use **structured** logs (JSON), so they can be searched: `{"level":"error","msg":"payment failed","orderId":42}`.
- Give each request an id, and include it in every log line of that request.
- Never log passwords, tokens or card numbers.

## Health checks

Platforms ask your service whether it is well:

```javascript
app.get("/health", (req, res) => res.json({ status: "ok" }));
```

A **readiness** check also verifies the things it needs, such as the database, so that traffic is sent only when it can be served.

## Common mistakes

- **Business rules inside route handlers.**
- **`new Date()` and `Math.random()` buried in the logic**, which makes tests unpredictable.
- **Tests that need a running server and a real database** for everything.
- **Fakes that behave differently from the real thing.** Keep them tiny, and cover the real one with a few integration tests.
- **No graceful shutdown.**
