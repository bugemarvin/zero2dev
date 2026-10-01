# A server page with a client button

`lib/products.js` is given. It exports an async function `getProducts()` that returns an array such as `[{ id: 1, name: "Keyboard" }, ...]`.

## `app/like-button.jsx`, a client component

- Its first line is the directive `"use client";`
- `<LikeButton name="Keyboard" />` renders a button with the text `Like Keyboard (0)`.
- Each click adds one to the number.

## `app/page.jsx`, a server component

- It is an `async` function, with **no** `"use client"` directive.
- It awaits `getProducts()` and renders an `<h1>` with the text `Products`, and a `<ul>` with one `<li>` per product. Each item shows the product's name and a `LikeButton` for it.

The tests render the page the way the server does, and click the button in a simulated browser.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
