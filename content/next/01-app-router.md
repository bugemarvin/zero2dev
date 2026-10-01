---
title: Next.js and the app router
summary: A framework on top of React where folders become pages, and pages are rendered on the server.
---

## What Next.js adds

React builds user interfaces. It leaves open how pages are routed, where data is loaded, and how the result reaches the browser. **Next.js** is a framework that answers those questions:

- **Routing from the file system.** A folder is a URL.
- **Rendering on the server.** The browser receives finished HTML, which loads fast and is readable by search engines.
- **Data loading on the server**, next to the component that needs it.
- **API endpoints** in the same project.

This track assumes the [React track](react/01-components-and-jsx).

## Creating a project

```console
$ npx create-next-app@latest my-app
$ cd my-app
$ npm run dev
```

The exercises in this guide use a Next.js package set that the app downloads once (Setup, or `python3 check.py prefetch next`). Each exercise is a tiny project of its own.

## The app directory

Everything under `app/` defines routes:

```text
app/
    layout.js            wraps every page
    page.js              the page at /
    about/
        page.js          the page at /about
    blog/
        page.js          the page at /blog
        [slug]/
            page.js      the page at /blog/anything
```

| File | Role |
| --- | --- |
| `page.js` | the content of a route. A folder without one is not a page. |
| `layout.js` | shared frame around the pages below it |
| `loading.js` | shown while a page is loading |
| `error.js` | shown when a page throws an error |
| `not-found.js` | shown for a 404 |
| `route.js` | an API endpoint in place of a page |

A file that contains JSX may end in `.jsx` instead of `.js`: `page.jsx`, `layout.jsx`. The exercises in this track use `.jsx` for those files.

Only these special files create routes. Other files in the same folders, such as components and helpers, are ignored by the router, so you can keep them next to the pages that use them.

## A page

A page is a React component, exported as the default:

```jsx
// app/about/page.js
export default function About() {
  return (
    <main>
      <h1>About us</h1>
      <p>We make things.</p>
    </main>
  );
}
```

Visit `/about` and it is there. No route table to maintain.

## The root layout

`app/layout.js` is required. It supplies the `<html>` and `<body>` tags and receives the current page as `children`:

```jsx
// app/layout.js
export const metadata = {
  title: "My app",
  description: "A small Next.js app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`metadata` sets the page title and description. A page can export its own to override it.

## Server rendering

When a request for `/about` arrives, Next.js runs the component **on the server**, turns the result into HTML and sends it. Look at the page source in a browser and the text is there, with no waiting for JavaScript.

By default, components in the `app` directory run **only on the server**. Their code is not sent to the browser. Lesson 3 covers what that allows, and when a component must run in the browser instead.

## How the exercises are checked

For most exercises in this track the checker starts the real development server on your code, requests pages over HTTP, and looks at the status code and the HTML. The first request compiles the page, so a test run takes some seconds.

**Start app** runs the same server for you and gives you a link.

## Common mistakes

- **Naming the file after the route**, such as `app/about.js`. It must be `app/about/page.js`.
- **No default export** in a page.
- **Removing `<html>` and `<body>`** from the root layout.
- **Expecting browser APIs to work** in a page. Server code has no `window` and no `document`.
