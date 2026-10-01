---
title: The browser and the DOM
summary: How JavaScript changes a web page and reacts to the user. The foundation under React.
---

## A page is a tree

A browser turns HTML into a tree of objects called the **DOM** (Document Object Model). Each element, such as a paragraph or a button, is a node in that tree. JavaScript can read and change it, and the page updates at once.

```html
<body>
  <h1 id="title">Shopping</h1>
  <ul id="list"></ul>
  <button id="add">Add</button>
  <script type="module" src="app.js"></script>
</body>
```

`type="module"` makes the script an ES module, and makes it run after the page has been parsed.

## Finding elements

```javascript
const title = document.querySelector("#title");        // the first match of a CSS selector
const items = document.querySelectorAll("li");         // all matches
```

| Selector | Matches |
| --- | --- |
| `#title` | the element with `id="title"` |
| `.done` | elements with `class="done"` |
| `li` | every `<li>` |
| `ul > li` | `<li>` elements directly inside a `<ul>` |

`querySelector` returns `null` when nothing matches.

## Changing elements

```javascript
title.textContent = "My list";              // set the text
title.classList.add("big");                 // add a CSS class
title.classList.toggle("hidden");           // add it if absent, remove it if present
title.setAttribute("title", "tooltip");
title.style.color = "teal";
```

## Creating elements

```javascript
const list = document.querySelector("#list");
const item = document.createElement("li");
item.textContent = "Milk";
list.append(item);

item.remove();                              // take it out again
list.replaceChildren();                     // remove everything inside
```

> **Warning:** use `textContent` for text that comes from users or from a server. `innerHTML` interprets its value as HTML, so a name such as `<img src=x onerror=...>` would run code in the page. That attack is called **cross-site scripting** (XSS).

## Events

The browser reports what the user does through **events**. You register a function to be called when one happens:

```javascript
const button = document.querySelector("#add");

button.addEventListener("click", (event) => {
  console.log("clicked", event.target);
});
```

| Event | When |
| --- | --- |
| `click` | an element is clicked |
| `input` | the value of a form field changes |
| `submit` | a form is submitted |
| `keydown` | a key is pressed |
| `DOMContentLoaded` | the page has been parsed |

Forms reload the page when submitted, unless you stop that:

```javascript
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = form.elements.title.value;
});
```

## State and rendering

A reliable way to build an interactive page: keep the data in plain variables, the **state**, and have one function that makes the DOM match it.

```javascript
let items = ["Milk", "Bread"];

function render() {
  list.replaceChildren(
    ...items.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    })
  );
}

button.addEventListener("click", () => {
  items = [...items, "Eggs"];      // change the state
  render();                        // and redraw
});

render();
```

The event handlers never touch the DOM directly. They change the state and call `render`. The page is always a reflection of the data.

Hold on to that idea. It is exactly what React does, with the redrawing handled for you.

## Fetching data in a page

```javascript
async function load() {
  const response = await fetch("/api/todos");
  items = await response.json();
  render();
}
```

A page may freely call the server it came from. Calls to a **different** origin are blocked by the browser unless that server allows them with CORS headers.

## Testing DOM code without a browser

The exercises for this lesson and for React run in **jsdom**, an implementation of the DOM in JavaScript. A test creates elements, calls your function, simulates a click and inspects the result, with no window opening. It comes with the React package set, downloaded once from the Setup page.

## Developer tools

Press F12 in any browser. The **Console** shows `console.log` output and errors and lets you type JavaScript against the page. **Elements** shows the live DOM. **Network** shows every request. These are the tools you will use every day.

## Common mistakes

- **Running a script before the elements exist**, so `querySelector` returns `null`. Use `type="module"`.
- **`innerHTML` with untrusted text.**
- **Calling the handler in place of passing it**: `addEventListener("click", save())` runs `save` immediately.
- **Changing the DOM in many places** until it no longer matches the data.
- **Forgetting `event.preventDefault()`** on a form.
