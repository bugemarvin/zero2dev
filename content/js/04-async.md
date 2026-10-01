---
title: Asynchronous code
summary: Waiting for files, timers and the network without freezing everything. Promises and async/await.
---

## Why asynchronous

JavaScript runs your code on a single thread: one thing at a time. A request to a server can take a second. If the language simply waited, the whole page or server would freeze for that second.

So slow operations do not block. They start, your code carries on, and the result is delivered later. Code written for this is called **asynchronous**.

## Promises

A **promise** is an object that stands for a result that is not there yet. It is in one of three states: pending, fulfilled with a value, or rejected with an error.

```javascript
const promise = fetch("https://example.com/data.json");
```

`fetch` returns at once, with a promise. The response arrives later.

## async and await

`await` pauses the surrounding function until a promise settles, and gives you its value. It may only be used inside a function marked `async`, or at the top level of a module.

```javascript
async function loadUser(id) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  const user = await response.json();
  return user.name;
}
```

It reads from top to bottom like ordinary code. While this function waits, other code keeps running.

An `async` function **always returns a promise**. The caller awaits it too:

```javascript
const name = await loadUser(7);
```

## Errors

A rejected promise becomes an exception at the `await`. Handle it with `try` and `catch`:

```javascript
async function loadUserSafely(id) {
  try {
    return await loadUser(id);
  } catch (error) {
    console.error("could not load user:", error.message);
    return null;
  }
}
```

Throwing inside an `async` function rejects the promise it returned:

```javascript
async function mustBePositive(n) {
  if (n <= 0) {
    throw new Error("must be positive");
  }
  return n;
}
```

## Making a promise yourself

Wrap something that calls back later, such as a timer:

```javascript
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

await delay(1000);
console.log("one second later");
```

The function passed to `new Promise` receives `resolve` and `reject`. Call `resolve(value)` to fulfil the promise, or `reject(error)` to fail it.

## One after another, or all at once

Awaiting in a loop runs the operations **one after another**:

```javascript
const users = [];
for (const id of ids) {
  users.push(await loadUser(id));      // each waits for the one before
}
```

If they do not depend on each other, start them all and wait once. `Promise.all` takes an array of promises and gives the results in the same order:

```javascript
const users = await Promise.all(ids.map((id) => loadUser(id)));
```

Ten requests of one second each now take about one second, not ten.

| Function | Settles when |
| --- | --- |
| `Promise.all(list)` | all are fulfilled. Rejects as soon as one rejects. |
| `Promise.allSettled(list)` | all have finished, whatever the outcome |
| `Promise.race(list)` | the first one settles, either way |
| `Promise.any(list)` | the first one is fulfilled |

`Promise.race` gives a simple timeout: race the real work against a timer that rejects.

```javascript
function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timer]);
}
```

## Retrying

Network calls fail now and then. Trying again a few times is a loop with `try` and `catch`:

```javascript
async function retry(fn, times) {
  let lastError;
  for (let attempt = 0; attempt < times; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
```

## then and catch

Before `async` and `await`, promises were chained with methods. You will see this style in older code:

```javascript
fetch(url)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

## Common mistakes

- **Forgetting `await`.** You then hold a promise, not the value, and `user.name` is `undefined`.
- **`await` in a loop** when the operations could run together.
- **`array.forEach(async ...)`.** `forEach` does not wait for the promises. Use `for...of`, or `Promise.all` with `map`.
- **No error handling.** An unhandled rejection crashes a Node program.
- **Returning a value from inside a callback** and expecting the outer function to return it.
