---
title: Events and streams
summary: The two patterns behind most of Node's library: things that announce, and data that flows.
---

## EventEmitter

Many objects in Node announce what happens to them: a server announces a `request`, a stream announces `data`, a process announces `exit`. They all use `EventEmitter`:

```javascript
import { EventEmitter } from "node:events";

const orders = new EventEmitter();

orders.on("created", (order) => {
  console.log("send a confirmation for", order.id);
});
orders.once("created", () => console.log("the first order ever"));   // runs one time

orders.emit("created", { id: 1 });
```

- `on` registers a listener, `once` a listener that removes itself after one call, `off` removes one.
- `emit` calls the listeners **one after another, immediately**. It is not asynchronous.
- An `"error"` event with no listener throws. Always listen for `error` on emitters that can fail.

Your own class can extend it:

```javascript
class Downloader extends EventEmitter {
  async fetch(url) {
    this.emit("start", url);
    // ...
    this.emit("done", url);
  }
}
```

Events let parts of a program react to each other without knowing each other. The order module does not import the email module. It only says what happened.

## Streams

`readFile` loads the whole file into memory. For a 5 GB log on a server with 1 GB of memory, that does not work. A **stream** delivers data in **chunks**, and memory use stays small and constant.

| Kind | Example |
| --- | --- |
| Readable | a file being read, an incoming HTTP request |
| Writable | a file being written, an HTTP response |
| Transform | reads, changes, passes on: compression, encryption |
| Duplex | both directions: a network socket |

## Reading line by line

```javascript
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const lines = createInterface({ input: createReadStream("access.log") });

let errors = 0;
for await (const line of lines) {
  if (line.includes(" 500 ")) {
    errors++;
  }
}
console.log(errors);
```

`for await` consumes any readable stream. This loop handles a file of any size.

## Connecting streams

`pipeline` connects streams, passes errors on, and closes everything when it is over:

```javascript
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("access.log"),
  createGzip(),
  createWriteStream("access.log.gz"),
);
```

It is the same idea as a shell pipe: `cat access.log | gzip > access.log.gz`.

## Backpressure

A fast reader feeding a slow writer would fill memory with waiting chunks. Streams prevent it: when the writer's buffer is full, the reader is paused until it drains. `pipeline` and `for await` do this for you. Calling `.write()` in a loop by hand and ignoring its return value does not, which is why you should use `pipeline`.

## Your own transform

An async generator is the easiest way to write one. It works as a stage of `pipeline`:

```javascript
async function* upperCase(source) {
  for await (const chunk of source) {
    yield String(chunk).toUpperCase();
  }
}

await pipeline(process.stdin, upperCase, process.stdout);
```

## Chunks are not lines

A chunk is whatever amount of data arrived. It can end in the middle of a line, or in the middle of a character. Code that splits lines must keep the unfinished tail for the next chunk:

```javascript
async function* lines(source) {
  let rest = "";
  for await (const chunk of source) {
    const parts = (rest + chunk).split("\n");
    rest = parts.pop();             // the last piece may be incomplete
    yield* parts;
  }
  if (rest !== "") {
    yield rest;
  }
}
```

`readline` does exactly this for you.

## HTTP is streams

In an HTTP server, the request is a readable stream and the response is a writable one. A large file is sent without loading it:

```javascript
await pipeline(createReadStream("video.mp4"), res);
```

## Common mistakes

- **`readFile` for large files.**
- **`.pipe()` without error handling.** Use `pipeline`.
- **Assuming a chunk is a whole line**, or a whole JSON document.
- **No `error` listener** on an emitter.
- **Adding listeners in a loop** and never removing them. Node warns about a memory leak after ten.
