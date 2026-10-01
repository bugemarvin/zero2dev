# Two pages

This small project already has a root layout. Add two pages.

- `app/page.jsx`, served at `/`: an `<h1>` with the text `Welcome to my site`.
- `app/about/page.jsx`, served at `/about`: an `<h1>` with the text `About us`, and a `<p>` with the text `We make things.`

Each file exports a React component as its default export.

The checker starts the Next.js development server on your code and requests both pages. The first run takes some seconds while Next.js compiles.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
