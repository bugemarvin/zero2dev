---
title: What microservices are, and when to use them
summary: One program or many small ones. What you gain, what it costs, and how to decide.
---

## The monolith

Most systems start as one program: one code base, one deployment, one database. This is a **monolith**, and it is a perfectly good way to build software.

```text
+--------------------------------------+
|              the app                 |
|   users   orders   payments   mail   |
+-------------------+------------------+
                    |
               one database
```

It is simple to run, simple to test, and a call from one part to another is an ordinary function call that cannot fail halfway.

## Microservices

With **microservices** the system is split into small programs, each responsible for one business capability, each running on its own and talking to the others over the network.

```text
           +-----------+
client --> |  gateway  |
           +-----+-----+
        +--------+--------+
        v        v        v
    +-------+ +--------+ +----------+
    | users | | orders | | payments |
    +---+---+ +---+----+ +----+-----+
        |         |           |
      its db    its db      its db
```

Each service:

- has **one job**, and owns the data for it;
- is **deployed on its own**, without redeploying the others;
- exposes an **API** as its only way in;
- can be written in a different language from its neighbours.

## What you gain

- **Independent deployment.** A change to payments ships without touching orders.
- **Independent scaling.** If search is busy, run ten copies of search only.
- **Isolation of failure.** If the mail service is down, orders can still be placed, provided you designed for it.
- **Team autonomy.** A team owns a service from code to production.
- **Freedom of technology** per service.

## What it costs

Every gain is paid for with complexity that a monolith does not have:

- **The network.** A function call becomes a request that can be slow, fail, or time out. Every call needs error handling.
- **Data consistency.** There is no single transaction across services any more. Lesson 5 is about that.
- **Operations.** Ten services mean ten deployments, ten sets of logs, ten things to monitor.
- **Debugging.** One user action passes through several services. Finding where it went wrong needs tooling.
- **Testing.** Checking that services still work **together** is harder than testing one program.

## When to choose which

| Situation | Choose |
| --- | --- |
| a new product, a small team, unclear requirements | a monolith |
| parts with very different load or release rhythm | consider splitting those parts off |
| several teams blocked by one shared code base | microservices start to pay off |
| "because large companies do it" | not a reason |

The usual advice from people who have done both: **start with a well-structured monolith**. Split out a service when a concrete problem demands it. Boundaries drawn too early are usually drawn in the wrong place, and moving them across services is expensive.

A badly split system, where every request needs five services to answer and nothing can be deployed alone, is called a **distributed monolith**. It has the costs of both styles and the benefits of neither.

## Finding the boundaries

A good service boundary follows the **business**, not the technology.

- Good: users, orders, payments, catalogue.
- Poor: "the database service", "the validation service".

Two tests:

1. Can this service do its main job when its neighbours are down?
2. Does a typical change touch only this service?

If the answer to either is no, the boundary is in the wrong place.

## What this track builds

Small systems of two to four services in containers, using what the [Docker track](docker/04-compose) taught:

- services that call each other over HTTP;
- an API gateway in front of them;
- a queue and a worker for work that can happen later;
- timeouts, retries and fallbacks for when a service misbehaves.

The services are written in JavaScript with nothing but Node's standard library, so that every line is visible. They run in containers, so Node does not need to be installed on your machine. Docker does.

## Common mistakes

- **Starting with microservices** for a system nobody understands yet.
- **Splitting by technical layer** instead of by business capability.
- **A shared database** behind several services. That is one system with extra steps.
- **Ignoring the network**, as if a remote call were as reliable as a local one.
