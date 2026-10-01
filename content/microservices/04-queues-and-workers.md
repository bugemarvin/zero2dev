---
title: Queues and workers
summary: Not everything has to happen while the user waits. Hand slow work to a queue and let a worker do it.
---

## The limits of calling and waiting

So far every interaction was synchronous: a service calls another and waits. That has two weaknesses.

- **Slow work blocks the caller.** Resizing an image or sending a hundred emails does not fit in the half second a user will wait.
- **The caller depends on the callee being up right now.** If the mail service is down, the sign-up fails, although the mail could just as well go out a minute later.

## Asynchronous messaging

With a **queue** in between, the caller only records that work needs doing, and returns at once. A separate process, a **worker**, picks jobs off the queue and does them.

```text
client --> [api] --push--> ( queue ) --pop--> [worker]
        <-- 202 Accepted                         |
                                                 v
client --> GET /jobs/7 --> [api] <--read--  ( results )
```

- The API answers immediately with **202 Accepted** and a job id.
- The worker processes jobs at its own pace.
- The client asks for the result later, or is notified.

If the worker is down, jobs wait in the queue. Nothing is lost, and the API keeps accepting work. If jobs pile up, start more workers: they all take from the same queue.

## Redis as a queue

**Redis** is an in-memory data store that also makes a simple, fast queue. A Redis **list** with two commands is enough:

| Command | Effect |
| --- | --- |
| `LPUSH jobs value` | add at the left end |
| `BRPOP jobs 5` | take from the right end, waiting up to 5 seconds if the list is empty |
| `SET key value`, `GET key` | store and read a value |
| `INCR key` | add one to a counter, and return it |

Push on one side and pop on the other, and jobs come out in the order they went in.

`BRPOP` **blocks**: it waits for a job to arrive. So an idle worker costs nothing, and reacts the moment a job is pushed.

## The producer

```javascript
// api: accept a job
const id = await redis.command("INCR", "job:next-id");
const job = { id, text };
await redis.command("LPUSH", "jobs", JSON.stringify(job));
sendJson(res, 202, { id, status: "pending" });
```

A job is a small JSON document with everything the worker needs.

## The worker

A worker is not a web server. It is a loop:

```javascript
while (true) {
  const reply = await redis.command("BRPOP", "jobs", "5");
  if (reply === null) {
    continue;                              // nothing arrived within 5 seconds: wait again
  }
  const job = JSON.parse(reply[1]);        // reply is [list name, value]
  const result = handle(job);
  await redis.command("SET", `result:${job.id}`, JSON.stringify(result));
}
```

Do not name your own function `process`. In Node that name already belongs to the object that holds `process.env`, and a function of the same name would hide it.

## Reading the result

```javascript
// api: GET /jobs/:id
const stored = await redis.command("GET", `result:${id}`);
if (stored === null) {
  return sendJson(res, 200, { id, status: "pending" });
}
sendJson(res, 200, { id, status: "done", result: JSON.parse(stored) });
```

## Things will happen twice

A worker can crash after doing the work and before recording that it is done. The job is then delivered again. Message systems generally promise **at-least-once** delivery, so:

**Make jobs idempotent**: doing one twice must have the same effect as doing it once.

- "Set the status of order 7 to paid" is idempotent.
- "Add 10 to the balance" is not. Record the job id with the change, and skip a job that was already applied.

## When a job keeps failing

A job that crashes the worker every time would be retried for ever and block everything behind it. After a few attempts, move it aside to a **dead-letter queue**, where a person can look at it, and carry on.

## Events

A variation of the same idea: instead of telling a specific worker to do something, a service **announces what happened**, and any number of other services react.

```text
[orders] --publishes--> "order placed" --+--> [mail]       sends the confirmation
                                         +--> [stock]      reserves the items
                                         +--> [analytics]  counts it
```

The orders service does not know who listens. A new consumer is added without changing it. This is **publish and subscribe**. Kafka, RabbitMQ and NATS are the systems commonly used for it.

## Synchronous or asynchronous?

| Use a direct call when | Use a queue when |
| --- | --- |
| the caller needs the answer to continue | the work can happen later |
| it is fast | it is slow, or comes in bursts |
| failing immediately is acceptable | the work must not be lost if a service is down |

## Common mistakes

- **Doing slow work inside the request.**
- **Jobs that are not idempotent.**
- **A worker that polls in a tight loop**, in place of a blocking pop.
- **No limit on retries.**
- **Large payloads in the queue.** Put the data in storage, and its id in the job.
