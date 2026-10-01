---
title: Data and consistency
summary: Each service owns its data. That removes the single transaction, and this is how systems cope.
---

## One database per service

In a monolith every part of the code reads and writes one database. With microservices, each service has **its own**, and no other service may touch it.

```text
[users]  --> users database        [orders] --> orders database
```

The reason is independence. If two services share tables, a change to a table by one team breaks the other, and neither can be deployed alone. The database becomes the hidden coupling that makes the system a distributed monolith.

The only way to another service's data is its API.

## What you lose

**Joins.** `SELECT ... FROM orders JOIN users` is no longer possible: the tables are in different databases. The orders service has to ask the users service, or keep a copy of what it needs.

**Transactions.** In one database, "take the money and create the order" either happens completely or not at all. Across two services there is no such guarantee. The payment can succeed and the order creation fail.

## Keeping a copy

A service that often needs a little data from another can store its own copy, kept up to date through events:

```text
[users] --"user 3 renamed to Ada L."--> [orders] updates its copy of the name
```

The orders service can then answer without calling anyone. The copy may be a moment out of date, which leads to the central idea of this lesson.

## Eventual consistency

In a distributed system you often accept that different services see slightly different states for a short time, and that they **converge**. This is **eventual consistency**.

It is more familiar than it sounds. A bank transfer between two banks takes a day. The money is "in transit", and nobody considers the system broken.

The question to ask for each piece of data is: **what happens if this is a few seconds out of date?** For a display name, nothing. For an account balance at the moment of a withdrawal, a great deal. That one needs a single owner making the decision.

## Sagas

A **saga** replaces one transaction with a sequence of local steps. Each step has a **compensating action** that undoes it. If a step fails, the steps already done are compensated in reverse order.

Placing an order:

| Step | Action | Compensation |
| --- | --- | --- |
| 1 | orders: create the order as `pending` | mark the order `cancelled` |
| 2 | stock: reserve the items | release the reservation |
| 3 | payments: charge the card | refund the charge |
| 4 | orders: mark the order `confirmed` | |

If the payment in step 3 fails: release the stock, cancel the order. The system ends in a consistent state, having passed through intermediate ones.

Two points follow.

- **Intermediate states are visible.** An order really is `pending` for a moment. Design for that, and show it honestly.
- **A compensation is not a rollback.** A refund is a second transaction. An email that was sent cannot be unsent.

## Idempotency keys

Networks lose responses. The caller then does not know whether its request worked, and has to retry. If "charge the card" is simply repeated, the customer pays twice.

The caller sends a unique **idempotency key** with the request. The service remembers the keys it has handled:

```javascript
const key = req.headers["idempotency-key"];
const earlier = await store.get(`payment:${key}`);
if (earlier) {
  return sendJson(res, 200, earlier);        // same answer as before, no second charge
}
const result = await charge(amount);
await store.set(`payment:${key}`, result);
sendJson(res, 201, result);
```

A retry with the same key is safe. This one technique removes a whole class of duplicate-action bugs.

## The outbox

A service needs to change its database **and** publish an event. If it crashes between the two, the event is lost, or announced for a change that never happened.

The **outbox pattern**: write the event into a table of the same database, **in the same transaction** as the change. A separate process reads that table and publishes the events, retrying until it succeeds. Either both the change and the event exist, or neither.

## Choosing where the truth lives

For every piece of data, name **one** service as its owner. Others may cache it, and only the owner changes it. When two services both believe they own something, they will eventually disagree, and there is no way to tell which is right.

## Common mistakes

- **Services sharing a database.**
- **Assuming a remote update is instant** and reading it back from another service immediately.
- **No compensation** designed for the steps of a multi-service operation.
- **Retries without idempotency.**
- **Two owners** for the same data.
