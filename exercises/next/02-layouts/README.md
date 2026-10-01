# A shared frame and a nested layout

The pages already exist: `/`, `/about` and `/blog`. Give them their frames.

## `app/layout.jsx`, the root layout

Around the page content, on every page:

- a `<nav>` with three links made with the `Link` component from `next/link`: `Home` to `/`, `Blog` to `/blog` and `About` to `/about`;
- the page itself, inside a `<main>`;
- a `<footer>` with the text `My site`.

Keep the `<html>` and `<body>` tags.

## `app/blog/layout.jsx`, for the blog section only

- an `<aside>` with the text `Blog sidebar`;
- then the page.

The sidebar must appear on `/blog` and must not appear on `/` or `/about`.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
