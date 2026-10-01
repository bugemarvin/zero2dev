---
title: Building and deploying
summary: Turn the project into something that runs in production, and put it online.
---

## Development and production

`npm run dev` starts the development server. It compiles pages on demand, reloads on every change and shows detailed errors. It is slow and not meant for real visitors.

For production there are two steps:

```console
$ npm run build
$ npm run start
```

`build` compiles everything, renders the pages that can be rendered in advance, and reports what it produced:

```text
Route (app)                    Size
┌ ○ /                          1.2 kB
├ ○ /about                     0.9 kB
├ ● /blog/[slug]               1.4 kB
└ ƒ /api/notes                 0 B

○  (Static)   rendered once, at build time
●  (SSG)      rendered at build time for known parameters
ƒ  (Dynamic)  rendered on the server for every request
```

Read that table after every build. It tells you which pages are static, and static pages are the fastest and cheapest to serve. A page becomes dynamic when it uses something only known at request time: cookies, headers, the query string, or an uncached `fetch`.

The build also runs the linter and, in a TypeScript project, the type checker. A build that fails is a bug caught before your users saw it.

## Environment variables

| File | Used for | In Git |
| --- | --- | --- |
| `.env.local` | your own machine: local database, test keys | no |
| the hosting platform's settings | production values | never in the repository |

```javascript
process.env.DATABASE_URL            // server only
process.env.NEXT_PUBLIC_API_URL     // also sent to the browser
```

Anything prefixed `NEXT_PUBLIC_` ends up in the JavaScript that every visitor downloads. Never put a secret behind that prefix.

## Where to host

**A platform that understands Next.js**, such as Vercel or Netlify. Connect the Git repository, and every push is built and deployed. Each pull request gets its own preview address. This is the least work.

**Your own server or a container.** `npm run build` then `npm run start` runs anywhere Node runs. With Docker:

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Setting `output: "standalone"` in `next.config.js` makes the build collect only the files it needs, for a much smaller image.

**Static export.** If no page needs a server, `output: "export"` produces plain HTML, CSS and JavaScript files that any static host can serve. Route handlers, server actions and dynamic rendering are not available in that mode.

## Before going live

- **Images:** use `next/image`, which resizes and compresses them.
- **Fonts:** use `next/font`, which hosts them with your site and avoids layout shift.
- **Metadata:** every page has a title and a description.
- **Errors:** `error.js` and `not-found.js` exist and look right.
- **Secrets:** none are in the repository, and none are prefixed `NEXT_PUBLIC_`.
- **The build output:** pages you expected to be static are static.

## Measuring

Open the browser's developer tools and run **Lighthouse** on the production build, not on the dev server. It scores loading speed, accessibility and search-engine basics, and names what to fix.

## Where to go next

You can now build a full application with Next.js: pages and layouts, server and client components, dynamic routes, API endpoints, data loading and forms that change data.

What remains is a place to keep the data and a way to ship it:

- [SQL and PostgreSQL](sql/01-select), for a real database behind your server components and actions;
- Docker, to package the app and its database so they run the same everywhere.

## Common mistakes

- **Deploying `npm run dev`.**
- **Testing performance on the development server.**
- **Committing `.env.local`.**
- **A secret behind `NEXT_PUBLIC_`.**
- **Ignoring the build output**, and paying for dynamic rendering of pages that never change.
