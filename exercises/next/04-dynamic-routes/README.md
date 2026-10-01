# A page per product

`lib/products.js` is given. It exports `getProducts()` and `getProduct(id)`, where `id` is a **number**. `getProduct` returns `undefined` for an unknown id.

## `app/products/page.jsx`, at `/products`

A `<ul>` with one `<li>` per product. Each item contains a `Link` to that product's page, `/products/ID`, with the product's name as its text.

## `app/products/[id]/page.jsx`, at `/products/1`, `/products/2`, ...

- an `<h1>` with the product's name;
- a `<p>` with the text `Price: 49 EUR`, using the product's price.

If there is no product with that id, including when the id is not a number, call `notFound()` so that the response is a 404.

Remember that `params` is a promise, and that its values are strings.

This exercise uses the Next.js package set. Download it once from Setup, or run `python3 check.py prefetch next`.
