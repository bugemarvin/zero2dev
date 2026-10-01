---
title: Resilience and observability
summary: Services will fail. Make the system survive it, and make it possible to see what happened.
---

## Failure is normal

With many services on many machines, something is always slow, restarting or broken. A system that works only when everything works does not work.

The goal is that **one failing service degrades the system instead of taking it down**.

## Timeouts

A call with no timeout can wait for ever. A hanging service then makes its callers hang, whose callers hang too, until everything is waiting. That is a **cascading failure**.

**Every network call needs a timeout.**

```javascript
async function fetchWithTimeout(url, ms) {
  return fetch(url, { signal: AbortSignal.timeout(ms) });
}
```

`AbortSignal.timeout(ms)` cancels the request after the given time, and `fetch` then rejects.

Choose the timeout from how long the call normally takes, with some margin. Far shorter than "the default", which is often minutes.

## Retries

Many failures are brief: a restart, a network blip. Trying again often works.

```javascript
async function getWithRetry(url, attempts, timeoutMs) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (response.status < 500) {
        return response;                 // success, or the caller's own mistake: do not retry
      }
      lastError = new Error(`status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
```

Rules for retrying:

- **Retry 5xx and network errors. Do not retry 4xx.** A 404 or a 400 will be the same next time.
- **Only retry what is safe to repeat**: reads, and writes that are [idempotent](microservices/05-data-and-consistency).
- **Limit the attempts.** Three is common.
- **Wait between attempts**, a little longer each time, with some randomness. Otherwise a thousand clients retry at the same instant and knock the recovering service over again.

## Fallbacks

When a dependency stays down, decide what your service can still usefully do.

```javascript
try {
  const response = await getWithRetry(`${INVENTORY_URL}/stock/${item}`, 3, 500);
  const { stock } = await response.json();
  sendJson(res, 200, { item, stock });
} catch {
  sendJson(res, 200, { item, stock: null, degraded: true });
}
```

The product page still loads, without the stock figure. That is far better than an error page. Marking the response as `degraded` lets the client show it honestly.

Not everything has a fallback. A payment cannot be "roughly" processed. Decide per call whether the right reaction is a default value, a cached value, or a clear error.

## Circuit breakers

If a service is down, retrying against it wastes time on every request and adds load to something that is already struggling. A **circuit breaker** watches the failures:

| State | Behaviour |
| --- | --- |
| closed | calls go through. Failures are counted. |
| open | after too many failures, calls fail **at once** without being attempted |
| half-open | after a pause, one trial call is allowed. Success closes the circuit, failure opens it again. |

Callers get a fast answer, and the failing service gets room to recover.

## Health checks

| Check | Question | Used to |
| --- | --- | --- |
| liveness | is the process alive? | restart it if not |
| readiness | can it take requests right now? | stop sending it traffic until it can |

A service that is still starting, or has lost its database, is alive and not ready.

## Observability

When a request passes through five services, "it is slow" or "it failed" is the beginning of a search. Three kinds of information make that search possible.

**Logs.** Each service writes what it does, to standard output, as one line of JSON per event so that machines can search it:

```javascript
console.log(JSON.stringify({ time: new Date().toISOString(), level: "error", requestId, message: "inventory timeout", item }));
```

**A request id.** The gateway gives every incoming request a unique id and passes it along in a header. Every service includes it in its logs and in its own outgoing calls. Searching the logs for that one id shows the request's whole journey.

```javascript
const requestId = req.headers["x-request-id"] ?? crypto.randomUUID();
await fetch(url, { headers: { "x-request-id": requestId } });
```

**Metrics.** Numbers over time: requests per second, error rate, response time. They tell you **that** something is wrong, and when it started. Logs and traces tell you **why**.

**Tracing** combines these: it records how long each service spent on a request and draws the result as a timeline. OpenTelemetry is the common standard.

## Where to go next

You have built services that talk to each other, a gateway, a queue with a worker, and calls that survive failure. Together with [Docker](docker/01-images-and-containers) and a [database](sql/01-select), that is the foundation of most backend systems.

In production, the same ideas are run by an orchestrator such as **Kubernetes**, which starts containers, restarts them when their health checks fail, and scales them up and down. Everything in this track carries over.

## Common mistakes

- **No timeout.**
- **Retrying everything**, including errors that can never succeed and operations that are not safe to repeat.
- **Retrying immediately and without limit.**
- **No fallback**, so a minor service takes down a major page.
- **Logs with no request id**, impossible to connect across services.
