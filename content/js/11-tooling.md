---
title: Tooling and what comes next
summary: The tools around the language. Formatters, linters, bundlers and debugging.
---

## Formatting: Prettier

**Prettier** rewrites your code in one consistent style: indentation, quotes, line length. A team that uses it never discusses layout again.

```console
$ npm install -D prettier
$ npx prettier --write .
```

Most editors can run it on every save.

## Linting: ESLint

A **linter** finds likely bugs and bad practice without running the code: an unused variable, a missing `await`, a comparison that is always false.

```console
$ npm init @eslint/config@latest
$ npx eslint .
```

Formatters handle how code looks. Linters handle whether it is likely to be wrong. Projects use both.

## Bundlers: Vite

Browsers can load ES modules directly, but a real application has hundreds of files, uses packages from npm, and may be written in TypeScript or JSX. A **bundler** turns all of that into a few optimised files that a browser can load quickly.

**Vite** is the usual choice today:

```console
$ npm create vite@latest my-app
$ cd my-app
$ npm install
$ npm run dev
```

`npm run dev` starts a development server that updates the page the moment you save a file. `npm run build` produces the files to put on a web server.

## Debugging

**In the browser:** open the developer tools, go to Sources, and click a line number to set a **breakpoint**. The page stops there, and you can inspect every variable and step through line by line. Writing `debugger;` in your code does the same.

**In Node:**

```console
$ node --inspect-brk app.mjs
```

Then open `chrome://inspect` in Chrome, or use the debugger built into VS Code.

`console.log` remains useful. A few variations help:

```javascript
console.log({ user, count });       // prints the names along with the values
console.table(users);               // an array of objects as a table
console.error("something failed");  // goes to standard error
```

## package.json scripts

Put the commands of a project in `package.json`, so that nobody has to remember them:

```text
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "node --test",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

Then `npm run lint`, `npm test`, and so on. A new contributor reads this list first.

## Environment variables

Settings that differ between your machine and the server, and secrets such as API keys, do not belong in the code. Read them from the environment:

```javascript
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;
```

During development they usually live in a file named `.env`, loaded with `node --env-file=.env app.mjs`. That file must be in `.gitignore`. A secret committed to Git is a leaked secret.

## What you can do now

You know the language, modules, asynchronous code, Node, HTTP, a REST API, the basics of TypeScript and the DOM. That is enough to build things.

Where to go next in this guide:

- React for user interfaces;
- Next.js for complete web applications;
- [SQL and PostgreSQL](sql/01-select) to store data properly;
- Docker to package and run what you build.

## Common mistakes

- **No formatter or linter**, and time lost on things a tool would catch.
- **Committing `.env`.**
- **Many tools added at once.** Add one when you feel the problem it solves.
- **Debugging only with `console.log`** when a breakpoint would show everything at once.
