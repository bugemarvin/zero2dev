---
title: Deployments
summary: Replace a running version with a new one without anyone noticing, and get back fast when it goes wrong.
---

## Continuous delivery

With CI in place, the main branch always works. **Continuous delivery** takes the next step: every change that passes is **ready to deploy**, and deploying is one command or one button. **Continuous deployment** goes further: every passing change **is** deployed, automatically.

Both need the same thing: a deployment that is boring. Boring means automated, repeatable and reversible.

## The naive deployment

```text
stop the old version  ->  start the new version
```

Between the two steps the service is down. If the new version does not start, it stays down. For anything with users, that is not acceptable.

## Health checks

To replace a version safely, something must be able to tell whether an instance works. A **health check** is an endpoint that answers quickly:

```text
GET /health   ->   200 {"status": "ok"}
```

Two kinds are worth separating:

| Check | Question | When it fails |
| --- | --- | --- |
| **liveness** | is the process alive, or stuck? | restart it |
| **readiness** | can it serve requests right now? | stop sending it traffic, and wait |

An instance that is starting, or has lost its database, is alive and not ready. A load balancer sends requests only to instances that are ready.

## Rolling deployment

Replace instances **a few at a time**:

```text
v1 v1 v1 v1      start
v2 v1 v1 v1      replace one, wait until it is healthy
v2 v2 v1 v1
v2 v2 v2 v1
v2 v2 v2 v2      done
```

There is always capacity, and no downtime. If a new instance fails its health check, the rollout **stops**, and the instances already replaced are put back. For a while both versions run side by side, so they must be able to coexist.

This is the default in Kubernetes and most platforms.

## Blue-green deployment

Run two complete environments. **Blue** serves the users. Deploy the new version to **green**, test it there, then switch all traffic at once:

```text
users -> [ blue: v1 ]        [ green: v2 ]  (tested, idle)
users ->   [ blue: v1 ]  (idle)        [ green: v2 ]
```

Rolling back is switching back, in seconds. The cost is double the infrastructure during the switch.

## Canary release

Send a **small share** of real traffic to the new version, and watch:

```text
 5% of users -> v2      95% -> v1
25% of users -> v2      75% -> v1
100% -> v2
```

If error rates or response times get worse for the canary, stop: only 5% of users were affected. This catches problems that no test environment shows, because the test is production itself. It needs good monitoring ([next lesson](devops/05-observability)).

## Rollback

Things will go wrong. What matters is how fast you recover.

- **Rolling back means deploying the previous version**, with the same automation. This is why artifacts are kept and tags never reused.
- Decide the rule in advance: "if the error rate doubles within ten minutes, roll back", and automate it if you can.
- **Roll back first, investigate afterwards.** Do not debug in production while users are suffering.
- Practise it. A rollback that has never been tried will not work when needed.

## Databases: the hard part

Code can be rolled back. Data cannot. During a rolling deployment the old and the new code run **at the same time, against the same database**. A migration that renames a column breaks the old version instantly.

The technique is **expand and contract**: split a breaking change into steps that are each compatible.

To rename the column `name` to `full_name`:

1. **Expand**: add `full_name`. Deploy code that writes **both** and reads the old one.
2. Copy the existing data into the new column.
3. Deploy code that reads the new column.
4. **Contract**: when no running version uses `name`, drop it.

Each step is safe to deploy and safe to roll back. It is slower than one migration, and it never takes the site down.

## Graceful shutdown

When an instance is replaced, it receives a signal (`SIGTERM`). It should stop accepting new requests, finish the ones in progress, close its connections and exit. An instance that just dies drops requests on every deployment.

## Deploy small, deploy often

Teams that deploy many times a day have **fewer** outages than teams that deploy monthly. Each change is small, so problems are easy to find and quick to undo. A deployment becomes a non-event.

## Common mistakes

- **Deployments done by hand**, from a checklist, by the one person who knows how.
- **No health check**, or one that returns 200 while the database is unreachable.
- **A migration that breaks the running version.**
- **No tested way back.**
- **Big releases on Friday afternoon.**
