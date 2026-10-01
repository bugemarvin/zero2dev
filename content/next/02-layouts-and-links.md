---
title: Layouts and navigation
summary: Share a frame between pages, nest frames inside each other, and move between pages without a full reload.
---

## Layouts wrap pages

A `layout.js` wraps every page in its folder and in the folders below it. The root layout typically holds what appears on every page:

```jsx
// app/layout.js
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
        </nav>
        <main>{children}</main>
        <footer>© My site</footer>
      </body>
    </html>
  );
}
```

`children` is the page, or the next layout down.

## Nested layouts

A layout inside a folder applies to that section only, **inside** the root layout:

```jsx
// app/blog/layout.js
export default function BlogLayout({ children }) {
  return (
    <div className="blog">
      <aside>Blog sidebar</aside>
      <section>{children}</section>
    </div>
  );
}
```

```text
/            RootLayout > Home
/about       RootLayout > About
/blog        RootLayout > BlogLayout > BlogIndex
/blog/hello  RootLayout > BlogLayout > Post
```

When you move between two blog pages, the layouts stay mounted. Only the page part changes, so state in the layout, such as an open menu or a search box, is kept.

## Link

Use the `Link` component for navigation inside the app:

```jsx
import Link from "next/link";

<Link href="/about">About</Link>
```

It renders an ordinary `<a href="/about">`, so it works without JavaScript and for search engines. With JavaScript, clicking it swaps the page content without reloading the whole document, and Next.js fetches linked pages in advance when they scroll into view.

A plain `<a>` also works, but triggers a full page load every time. Use `<a>` for links to **other** sites.

## Navigating from code

Inside a client component (next lesson), the router can be driven from code:

```jsx
"use client";
import { useRouter, usePathname } from "next/navigation";

function BackButton() {
  const router = useRouter();
  const pathname = usePathname();          // the current path, such as "/blog"
  return <button onClick={() => router.push("/")}>Leave {pathname}</button>;
}
```

`usePathname` is how a navigation bar highlights the current page.

## Metadata per page

```jsx
// app/about/page.js
export const metadata = { title: "About us" };
```

A title template in the root layout adds the site name to every page:

```jsx
export const metadata = {
  title: { default: "My site", template: "%s | My site" },
};
```

The About page then gets the title `About us | My site`.

## Styling

Import a CSS file in the root layout and it applies to every page:

```jsx
import "./globals.css";
```

For styles that belong to one component, name the file `Something.module.css`. Class names in it are made unique automatically:

```jsx
import styles from "./Card.module.css";

<div className={styles.card}>...</div>
```

## Route groups

A folder in round brackets organises files without appearing in the URL:

```text
app/
    (marketing)/
        layout.js        a layout for these pages only
        about/page.js    still served at /about
    (shop)/
        layout.js
        cart/page.js     /cart
```

That gives different sections different layouts with no change to the URLs.

## Common mistakes

- **Forgetting `{children}`** in a layout. Every page under it comes out empty.
- **`<a>` for internal links**, causing a full reload each time.
- **`<html>` and `<body>` in a nested layout.** Only the root layout has them.
- **Importing `useRouter` from `next/router`.** In the app directory it comes from `next/navigation`.
- **Putting page-specific content in a layout.**
