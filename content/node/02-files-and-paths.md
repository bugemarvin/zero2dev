---
title: Files and paths
summary: Read, write and walk the file system with promises, and handle the errors that will happen.
---

## fs/promises

```javascript
import { readFile, writeFile, appendFile, mkdir, readdir, stat, rm, rename } from "node:fs/promises";

const text = await readFile("notes.txt", "utf8");       // without "utf8" you get a Buffer of bytes
await writeFile("out.txt", "hello\n");                  // creates or replaces
await appendFile("log.txt", "one more line\n");
await mkdir("data/cache", { recursive: true });         // like mkdir -p: no error if it exists
await rm("data/cache", { recursive: true, force: true });
```

Every function returns a promise. Forgetting `await` means the next line runs before the file is written.

## Paths

Never build paths by joining strings with `/`. Windows uses `\`, and it is easy to produce `a//b` or to forget a separator.

```javascript
import path from "node:path";

path.join("data", "users", "42.json")       // data/users/42.json
path.resolve("data")                        // an absolute path, from the current folder
path.basename("/tmp/report.csv")            // report.csv
path.extname("report.csv")                  // .csv
path.dirname("/tmp/report.csv")             // /tmp
```

A relative path is resolved from the folder the program was **started** in, not from the folder of the source file. To find files that live next to your code:

```javascript
const here = import.meta.dirname;                       // the folder of this module
const template = path.join(here, "templates", "mail.txt");
```

## Errors have codes

File operations fail for ordinary reasons. The error object has a `code`:

| Code | Meaning |
| --- | --- |
| `ENOENT` | no such file or directory |
| `EEXIST` | it already exists |
| `EACCES` | permission denied |
| `EISDIR` | it is a directory, a file was expected |

```javascript
async function readJsonOr(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;        // anything else is a real problem: pass it on
  }
}
```

Catch the error you expect, and **rethrow the rest**. A bare `catch {}` that swallows everything hides permission problems and broken JSON.

Do not check whether a file exists and then open it. Between the check and the use, the file can disappear. Just try, and handle `ENOENT`.

## Directories

```javascript
const names = await readdir("data");                                // names only
const entries = await readdir("data", { withFileTypes: true });     // with their kind
for (const entry of entries) {
  if (entry.isDirectory()) {
    // ...
  }
}

const info = await stat("data/users.json");
console.log(info.size, info.mtime, info.isFile());
```

Walking a tree is a recursive function: for each entry, if it is a folder, call yourself.

```javascript
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}
```

## Writing safely

If the program crashes in the middle of `writeFile`, the file is left half written. For data that matters, write to a temporary file and rename it. A rename is atomic: readers see the old file or the new one, never a mixture.

```javascript
await writeFile(file + ".tmp", JSON.stringify(data, null, 2));
await rename(file + ".tmp", file);
```

## Several things at once

```javascript
const [users, orders] = await Promise.all([
  readFile("users.json", "utf8"),
  readFile("orders.json", "utf8"),
]);
```

`Promise.all` starts all of them and waits for all. With `await` in a loop they run one after another. For hundreds of files, limit how many run together, or you will hit "too many open files".

## Never trust a path from a user

```javascript
const file = path.join("uploads", req.params.name);     // name = "../../etc/passwd"
```

This is **path traversal**. Resolve the path and check that it is still inside the folder you meant:

```javascript
const root = path.resolve("uploads");
const file = path.resolve(root, name);
if (!file.startsWith(root + path.sep)) {
  throw new Error("invalid path");
}
```

## Common mistakes

- **Forgetting `await`.**
- **Joining paths with `+`.**
- **Assuming the current folder** is the folder of the script.
- **Catching every error** and returning a default.
- **Reading a multi-gigabyte file with `readFile`.** It must fit in memory. Use streams, the subject of the next lesson.
