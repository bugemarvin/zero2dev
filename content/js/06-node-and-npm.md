---
title: Node and npm
summary: Files, arguments and exit codes in Node, and the package manager that the whole JavaScript world shares.
---

## A command-line program

```javascript
import { readFileSync } from "node:fs";

const [file] = process.argv.slice(2);

if (!file) {
  console.error("usage: node count.mjs FILE");
  process.exit(2);
}

const text = readFileSync(file, "utf8");
console.log(text.split("\n").length);
```

- `process.argv` holds the command line. The first two entries are the path to `node` and the path to the script, so the real arguments start at index 2.
- `console.log` writes to standard output, `console.error` to standard error.
- `process.exit(code)` ends the program with an exit code. 0 means success.
- `process.env.HOME` reads an environment variable.

## Files

```javascript
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const text = readFileSync("notes.txt", "utf8");       // waits; simple, fine for scripts
writeFileSync("out.txt", "hello\n");

const later = await readFile("notes.txt", "utf8");    // asynchronous; use this in servers
```

Reading a file that does not exist throws an error whose `code` is `"ENOENT"`:

```javascript
try {
  const text = readFileSync(file, "utf8");
} catch (error) {
  if (error.code === "ENOENT") {
    console.error(`error: ${file} not found`);
    process.exit(1);
  }
  throw error;
}
```

Build paths with `node:path`, which uses the right separator on every system:

```javascript
import path from "node:path";
const full = path.join("data", "2025", "report.txt");
```

## npm

**npm** is the package manager that comes with Node. A project is a folder with a `package.json`:

```console
$ mkdir shop && cd shop
$ npm init -y
$ npm install express
```

```text
{
  "name": "shop",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "test": "node --test"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

| File or folder | What it is | In Git? |
| --- | --- | --- |
| `package.json` | the project's name, scripts and the packages it needs | yes |
| `package-lock.json` | the exact version of every package that was installed | yes |
| `node_modules/` | the downloaded packages | **no**: add it to `.gitignore` |

Anyone who clones the project runs `npm install` and gets the same packages.

`"type": "module"` makes `.js` files in the project ES modules, so the `.mjs` ending is no longer needed.

| Command | Does |
| --- | --- |
| `npm install` | install everything listed in `package.json` |
| `npm install name` | add a package |
| `npm install -D name` | add a tool needed only during development |
| `npm run start` | run the script named `start` |
| `npm test` | run the script named `test` |
| `npx name` | run a tool from `node_modules`, or download and run it once |
| `npm ci` | install exactly what the lock file says, for automated builds |

## Version ranges

Versions have three parts: `major.minor.patch`. A major version may break things, a minor one adds features, a patch fixes bugs.

`"^5.1.0"` accepts any version from 5.1.0 up to, and not including, 6.0.0. The lock file records which one you actually have.

## Testing with Node

Node has a test runner built in. It is what checks the exercises of this track:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { total } from "./cart.mjs";

test("an empty cart costs nothing", () => {
  assert.equal(total([]), 0);
});

test("adds up the prices", () => {
  assert.deepEqual(total([{ price: 2 }, { price: 3 }]), 5);
});
```

```console
$ node --test
```

`assert.equal` compares simple values with `===`. `assert.deepEqual` compares arrays and objects by their contents. `assert.throws(() => f())` checks that an error is thrown, and `await assert.rejects(promise)` that a promise rejects.

## How this guide uses npm

Exercises that need packages share one folder of dependencies per stack, installed once, so you do not download Express or React for every exercise. The app's Setup page shows whether a package set is ready, and downloads it when you ask. That one download needs the internet. After it, everything works offline.

## Common mistakes

- **Committing `node_modules`.**
- **Not committing `package-lock.json`.**
- **Installing globally with `npm install -g`** what should be a project dependency.
- **Reading `process.argv[0]`** as the first argument. Start at index 2.
- **Synchronous file calls in a server**, which block every other request while they run.
