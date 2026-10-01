---
title: Modules
summary: Split a program into files that share exactly what they choose to.
---

## One file, one module

In modern JavaScript every file is a **module**. What is inside stays private unless it is exported, and other files state what they need with `import`.

`cart.mjs`:

```javascript
export const TAX_RATE = 0.2;

export function total(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function round(n) {              // not exported: private to this file
  return Math.round(n * 100) / 100;
}
```

`main.mjs`:

```javascript
import { total, TAX_RATE } from "./cart.mjs";

console.log(total([{ price: 5 }, { price: 7 }]) * (1 + TAX_RATE));
```

- The path starts with `./` for a file next to this one, and includes the file ending.
- The names in the braces must match the exported names.

## Named and default exports

A module can have many **named** exports, and at most one **default** export.

```javascript
// format.mjs
export function money(n) {
  return n.toFixed(2);
}

export default function summary(items) {
  return `${items.length} items`;
}
```

```javascript
import summary, { money } from "./format.mjs";    // default first, no braces
import describe from "./format.mjs";              // a default can be given any name
import { money as formatMoney } from "./format.mjs";
import * as format from "./format.mjs";           // everything, as format.money
```

Prefer named exports. The name stays the same everywhere, and editors can find and rename it.

## Imports are live and read-only

An imported name cannot be reassigned by the importing file. A module's code runs **once**, the first time it is imported, however many files import it. So a module can hold shared state, such as a connection or a cache.

## Pure functions

A module of functions is easiest to trust when those functions are **pure**: the result depends only on the arguments, and nothing outside is modified.

```javascript
// impure: changes the array it was given
export function addItem(cart, item) {
  cart.push(item);
  return cart;
}

// pure: returns a new array
export function addItem(cart, item) {
  return [...cart, item];
}
```

Pure functions can be tested with no setup, and callers are never surprised. React, later in this guide, depends on this style: it detects changes by noticing that you produced a **new** array or object.

## The two module systems

You will meet two systems in existing code.

| | ES modules | CommonJS |
| --- | --- | --- |
| Syntax | `import` and `export` | `require()` and `module.exports` |
| Where | browsers, modern Node | older Node code |
| File ending in Node | `.mjs`, or `.js` with `"type": "module"` in `package.json` | `.cjs`, or `.js` by default |

```javascript
// CommonJS, for recognition
const fs = require("fs");
module.exports = { total };
```

Write ES modules. This track uses the `.mjs` ending so that Node treats each file as one with no further configuration.

## Built-in modules

Node ships with modules of its own, imported with the `node:` prefix:

```javascript
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
```

Packages installed from npm are imported by their bare name, such as `import express from "express"`. Lesson 6 covers npm.

## Organising a project

- One topic per file: `cart.mjs`, `format.mjs`, `api.mjs`.
- Keep what a module exports small. The less other files can reach, the freer you are to change the inside.
- Avoid two modules that import each other.

## Common mistakes

- **Leaving off `./`.** `import x from "cart.mjs"` looks for an installed package of that name.
- **Leaving off the file ending** in Node.
- **Braces around a default import**, or none around a named one.
- **Mixing `require` and `import`** in the same file.
- **Mutating arguments** in a function others rely on.
