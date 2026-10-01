---
title: Observability
summary: Logs, metrics and traces: knowing what a system is doing, and being told before the users tell you.
---

## You cannot fix what you cannot see

On your laptop you see everything: the terminal, the debugger, the screen. In production the program runs on machines you never look at, serving people you never meet. **Observability** is how much you can learn about the inside of a system from what it sends out.

There are three kinds of signal.

## Logs

A **log** is a record of something that happened, with a time:

```text
2025-05-03T10:21:07Z ERROR payment failed order=1042 reason="card declined"
```

Guidelines:

- Write logs to **standard output**. The platform collects them. A program should not manage log files.
- Use **levels**: `debug`, `info`, `warn`, `error`. Production usually runs at `info`.
- Use **structured logs**: one JSON object per line. Then a tool can search and count them:

```json
{"time": "2025-05-03T10:21:07Z", "level": "error", "msg": "payment failed", "order": 1042, "request_id": "a1f3"}
```

- Give every request a **request id**, and put it in every log line that belongs to it. One search then shows the whole story of that request.
- **Never log secrets or personal data**: passwords, tokens, card numbers.
- Log what you will need at 3 a.m.: what was attempted, with which ids, and why it failed.

## Metrics

A **metric** is a number measured over time: requests per second, memory in use, orders placed. Metrics are cheap to store and quick to graph, so they are what dashboards and alerts are built from.

For a service that answers requests, watch four things, known as the **golden signals**:

| Signal | Question |
| --- | --- |
| **traffic** | how many requests are coming in? |
| **errors** | how many of them fail? |
| **latency** | how long do they take? |
| **saturation** | how full is it: CPU, memory, connections? |

## Averages hide the pain

Nine requests take 100 ms and one takes 5 seconds. The average is 590 ms, a number that describes none of them.

Use **percentiles**:

- **p50** (the median): half of the requests are faster than this.
- **p95**: 95% of the requests are faster. One in twenty is slower.
- **p99**: one in a hundred is slower.

A simple way to compute a percentile, the **nearest-rank** method: sort the values, and take the one at position `ceil(p / 100 * n)`, counting from 1.

```text
values: 12 15 20 22 30 31 40 45 90 400     n = 10
p50: ceil(0.50 * 10) = 5th   ->  30
p95: ceil(0.95 * 10) = 10th  ->  400
```

The slow requests are not rare for a real user: one page loads dozens of resources, so most visits contain at least one of them. Performance work aims at p95 and p99.

## Traces

In a system of several services, one click passes through many of them. A **trace** follows a single request across all of them, and shows where the time went:

```text
GET /checkout                      820 ms
  auth service                      15 ms
  cart service                      40 ms
  payment service                  750 ms
    external card processor        730 ms     <- here
```

Each step is a **span**. The request id is passed along in a header, so every service adds its spans to the same trace. **OpenTelemetry** is the common standard for producing all three kinds of signal.

## Service level objectives

"The site should be fast and reliable" cannot be checked. A **service level objective (SLO)** can:

```text
99.9% of requests succeed, measured over 30 days.
95% of requests are answered within 300 ms.
```

99.9% allows about 43 minutes of failure a month. That allowance is the **error budget**. While budget is left, the team ships features. When it is used up, the team works on reliability. The number turns an argument into a decision.

100% is the wrong target. It is impossibly expensive, and users cannot tell 99.99% from 100% through their own network.

## Alerts

An **alert** wakes a person. So every alert must be:

- about something **users feel**: errors up, latency up. Not "CPU at 80%", which may be perfectly fine;
- **actionable**: there is something to do right now;
- **rare**. A team that gets fifty alerts a day ignores all of them, including the one that mattered.

Symptoms page a person. Causes go on a dashboard.

## When things break

Every system has incidents. Good teams handle them the same way each time:

1. **Restore service first.** Roll back, switch off the feature, add capacity.
2. Keep a written timeline while it happens.
3. Afterwards, write a **postmortem**: what happened, why, and what will change so that it cannot happen the same way again.
4. Make it **blameless**. The question is "what in our system let this mistake reach production?", never "who did it?". People who fear blame hide problems, and hidden problems come back.

## Common mistakes

- **No logs for the failure you are trying to understand**, and a new deployment needed just to add them.
- **Logging everything**, so the one useful line is buried.
- **Watching averages.**
- **Alerts on causes**, and so many that nobody reads them.
- **Secrets and personal data in logs.**
- **Postmortems that end with "be more careful".** That changes nothing. Change the system.
