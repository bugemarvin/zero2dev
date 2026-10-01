---
title: Dynamic routes
summary: One page file for thousands of URLs, with the changing part passed in as a parameter.
---

## A folder in square brackets

A shop has a page for every product. You do not create a folder per product. A folder whose name is in square brackets matches **any** value in that position:

```text
app/
    products/
        page.js          /products
        [id]/
            page.js      /products/1, /products/42, /products/anything
```

The page receives the matched value in its `params` prop. `params` is a promise, so `await` it:

```jsx
// app/products/[id]/page.js
import { getProduct } from "../../../lib/products.js";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProduct(Number(id));

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price} EUR</p>
    </main>
  );
}
```

Parameters are always **strings**. Convert them when you need a number.

## Not found

If no product has that id, the right answer is a 404, not a crash and not an empty page. Call `notFound()`:

```jsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) {
    notFound();
  }
  return <h1>{product.name}</h1>;
}
```

`notFound()` stops rendering and responds with status 404. Add `app/not-found.js` to design what the visitor sees:

```jsx
// app/not-found.js
export default function NotFound() {
  return <h1>Nothing here</h1>;
}
```

## Linking to dynamic pages

Build the path with a template literal:

```jsx
import Link from "next/link";

{products.map((product) => (
  <li key={product.id}>
    <Link href={`/products/${product.id}`}>{product.name}</Link>
  </li>
))}
```

## Several parameters

```text
app/shop/[category]/[item]/page.js      /shop/books/dune
```

```jsx
const { category, item } = await params;
```

A folder named `[...path]` catches all remaining segments, as an array:

```text
app/docs/[...path]/page.js      /docs/a/b/c   gives   path = ["a", "b", "c"]
```

## The query string

Values after the `?` arrive in `searchParams`, also a promise:

```jsx
// /products?sort=price&page=2
export default async function Products({ searchParams }) {
  const { sort = "name", page = "1" } = await searchParams;
  ...
}
```

Use the path for **what** is being shown, and the query string for **how**: sorting, filtering, paging.

## A title per page

Export `generateMetadata` to compute the title from the parameter:

```jsx
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(Number(id));
  return { title: product ? product.name : "Not found" };
}
```

## Building pages in advance

If the list of possible values is known when the site is built, `generateStaticParams` tells Next.js to render those pages ahead of time. They are then served as plain files, which is as fast as a page can be.

```jsx
export function generateStaticParams() {
  return getProducts().map((product) => ({ id: String(product.id) }));
}
```

## Common mistakes

- **Forgetting to `await params`.**
- **Using the parameter as a number** without converting it: `"2" === 2` is false.
- **Rendering with a missing record**, which throws on `product.name`. Check, and call `notFound()`.
- **Putting sort and filter options in the path** when they belong in the query string.
- **A folder named `[id].js`.** It is a folder `[id]` containing `page.js`.
