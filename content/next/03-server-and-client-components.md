---
title: Server and client components
summary: Where each component runs, what each kind can do, and how to combine them.
---

## Two kinds of component

In the `app` directory a component is one of two kinds.

| | Server component (the default) | Client component |
| --- | --- | --- |
| Runs | on the server only | on the server for the first HTML, then in the browser |
| Code sent to the browser | none | yes |
| Can be `async` and read data directly | yes | no |
| Can use secrets, the database, the file system | yes | **no** |
| `useState`, `useEffect`, event handlers | no | yes |
| `window`, `document`, `localStorage` | no | yes |

Server components do the reading and the heavy lifting, and cost the browser nothing. Client components add interactivity.

## Server components

A server component can be `async` and fetch what it needs right in its body:

```jsx
// app/page.js
import { getProducts } from "../lib/products.js";

export default async function Home() {
  const products = await getProducts();
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

No `useEffect`, no loading state, no API endpoint in between. The data never has to travel to the browser as JSON to be rendered there: the browser receives the finished list.

## Client components

Put the directive `"use client"` on the **first line** of a file to make its components client components:

```jsx
// app/counter.js
"use client";

import { useState } from "react";

export default function Counter({ start = 0 }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

A component needs `"use client"` when it uses state, effects, event handlers such as `onClick`, or browser APIs.

Without the directive, the build fails with a message such as "You're importing a component that needs `useState`. This React Hook only works in a Client Component."

## Combining them

A server component can render a client component and pass it props:

```jsx
// app/page.js  (server)
import Counter from "./counter.js";

export default async function Home() {
  const start = await loadStartValue();
  return (
    <main>
      <h1>Dashboard</h1>
      <Counter start={start} />
    </main>
  );
}
```

Props that cross from server to client must be **serialisable**: strings, numbers, booleans, plain objects and arrays, dates. Functions and class instances cannot be passed.

The reverse does not work by import: a client component cannot import a server component, because everything a client file imports becomes client code. It **can** receive server-rendered content as `children`:

```jsx
// app/panel.js  (client)
"use client";
import { useState } from "react";

export default function Panel({ children }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && children}
    </section>
  );
}
```

```jsx
// app/page.js  (server)
<Panel>
  <ServerRenderedList />
</Panel>
```

## Keep the client part small

`"use client"` marks a boundary. That file and everything it imports is sent to the browser. So put the directive as far down the tree as you can:

- the page stays a server component and loads the data;
- only the interactive piece, a button, a form, a menu, is a client component.

A common mistake is to add `"use client"` to a whole page because one button needs a click handler. Extract the button.

## Protecting server code

Code that uses a secret must never end up in a client bundle. Server components guarantee that for themselves. For shared helper modules, environment variables give a second line of defence: only variables whose names start with `NEXT_PUBLIC_` are available in the browser.

```javascript
process.env.DATABASE_URL            // server only
process.env.NEXT_PUBLIC_SITE_NAME   // also readable in the browser
```

## Common mistakes

- **`"use client"` not on the first line**, or missing its quotes.
- **`"use client"` everywhere**, which gives up the benefits of server rendering.
- **Hooks or `onClick` in a server component.**
- **Passing a function as a prop** from a server component to a client component.
- **Reading `window` or `localStorage` during rendering** in a client component. Its first render happens on the server. Use an effect.
