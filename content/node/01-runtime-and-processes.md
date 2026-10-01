---
title: The runtime: event loop, modules and processes
summary: What Node really is, why it handles many connections with one thread, and how a program talks to its environment.
---

This track builds on [JavaScript and TypeScript](js/01-values-and-functions). You should be comfortable with functions, modules and `async`/`await` before you start.

## What Node is

Node.js is the V8 JavaScript engine from Chrome, plus a library for the things a browser does not let JavaScript do: files, network sockets, processes. It turns JavaScript into a language for servers and command-line tools.

## One thread, many connections

Most server platforms give each request its own thread. Node runs your JavaScript on **one thread** and never waits:

```javascript
import { readFile } from "node:fs/promises";

console.log("1 start");
readFile("big.txt", "utf8").then(() => console.log("3 file is here"));
console.log("2 carry on");
```

`readFile` hands the work to the operating system and returns at once. Node goes on with other things. When the data arrives, the callback is put in a queue, and the **event loop** runs it as soon as your code is idle.

While one request waits for the database, the same thread serves a hundred others. That is why Node is good at **I/O-heavy** work: APIs, proxies, chat.

The same design is its weakness. **Anything slow on the main thread blocks everyone:**

```javascript
app.get("/report", (req, res) => {
  const data = fs.readFileSync("huge.csv");     // every other request waits
  let total = 0;
  for (let i = 0; i < 5e9; i++) total += i;     // and waits
  res.send(String(total));
});
```

Rules that follow:

- Use the asynchronous functions (`fs/promises`), never the `...Sync` ones, in a server.
- Move heavy computation to a **worker thread**, a separate service or a queue.

## Order of execution

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A D C B
```

Synchronous code runs to the end first. Then promise callbacks (microtasks). Then timers and I/O callbacks.

## Modules

Modern Node uses ES modules: files named `.mjs`, or `.js` in a project whose `package.json` has `"type": "module"`.

```javascript
import { readFile } from "node:fs/promises";     // built in: the node: prefix
import express from "express";                   // from node_modules
import { add } from "./math.mjs";                 // your own file: path and extension
```

Top-level `await` works in ES modules.

## The process object

`process` is the running program:

| Member | Holds |
| --- | --- |
| `process.argv` | the command line: `[node, script, ...your arguments]` |
| `process.env` | environment variables, all strings |
| `process.cwd()` | the folder the program was started from |
| `process.exitCode` | the exit code to finish with |
| `process.stdin`, `stdout`, `stderr` | the standard streams |
| `process.on("SIGTERM", ...)` | react to a stop signal |

```javascript
const [, , command, ...rest] = process.argv;
const port = Number(process.env.PORT ?? 3000);
```

## Configuration comes from the environment

A program must run on your laptop, in a test and in production **without changing its code**. So everything that differs goes into environment variables: ports, database addresses, secrets.

```javascript
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`missing environment variable ${name}`);
  }
  return value;
}
```

Read and check configuration **once, at start-up**. A server that refuses to start is better than one that fails on the first request at night.

Node can load a `.env` file during development: `node --env-file=.env server.mjs`. That file holds secrets and never goes into Git.

## Exit codes

`0` means success, anything else failure. Scripts, CI pipelines and containers depend on it:

```javascript
process.exitCode = 1;       // set it and let the program finish
```

Prefer setting `exitCode` to calling `process.exit()`, which can cut off output that is still being written.

## Errors nobody caught

```javascript
process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});
```

A promise that rejects with no handler crashes current versions of Node. That is correct: the program is in an unknown state. Log, exit, and let the supervisor start a fresh process.

## Common mistakes

- **`...Sync` functions in request handlers.**
- **CPU-heavy loops on the main thread.**
- **Reading `process.env` all over the code**, with different defaults in different files.
- **Forgetting that environment variables are strings.** `process.env.DEBUG === "false"` is a non-empty string, which is truthy.
- **Forgetting `await`**, so an error becomes an unhandled rejection far from its cause.
