---
title: Components and JSX
summary: Build a user interface out of small functions that return markup.
---

## The idea

In [the DOM lesson](js/10-the-browser-and-dom) you kept data in variables and wrote a `render` function to make the page match. React is that idea, made into a library: you describe what the page should look like **for the current data**, and React updates the real DOM to match, changing only what differs.

A React app is built from **components**: functions that return a piece of the interface.

```jsx
function Greeting() {
  return <h1>Hello, React!</h1>;
}
```

## JSX

The HTML-like syntax inside JavaScript is **JSX**. A build tool turns it into ordinary function calls. It is not a string and not a template: it is JavaScript, so you can store it in variables and return it from functions.

The rules that differ from HTML:

| Rule | Example |
| --- | --- |
| a component returns **one** root element | wrap siblings in `<div>` or an empty `<>...</>` |
| every tag is closed | `<img />`, `<br />`, `<input />` |
| `class` is written `className` | `<p className="note">` |
| `for` on a label is `htmlFor` | `<label htmlFor="email">` |
| attributes with several words use camelCase | `onClick`, `tabIndex` |
| JavaScript goes inside braces | `<p>{user.name}</p>` |

```jsx
function Profile() {
  const name = "Ada";
  const skills = 3;
  return (
    <>
      <h2 className="title">{name}</h2>
      <p>{skills * 2} years of experience</p>
      <img src="/ada.png" alt={`Portrait of ${name}`} />
    </>
  );
}
```

Inside braces you can put any **expression**: a variable, a calculation, a function call. Statements such as `if` and `for` are not expressions, and the next lessons show what to use instead.

## Composing components

A component is used like a tag. Its name **must start with a capital letter**. That is how React tells your components from HTML elements.

```jsx
function Header() {
  return <h1>My shop</h1>;
}

function Footer() {
  return <p>Open every day</p>;
}

export default function App() {
  return (
    <div>
      <Header />
      <p>Welcome.</p>
      <Footer />
    </div>
  );
}
```

`App` is the root. Each component can use others, forming a tree. Splitting an interface into small components, each with one job, is the main skill in React.

## Putting it on a page

Somewhere, once, the root component is attached to an element of a real HTML page:

```jsx
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
```

A tool such as Vite serves the page and translates JSX. The exercises come with this file already written.

## Text is safe by default

A value placed in braces is inserted as **text**. If `name` contains `<b>`, the user sees those characters. The cross-site scripting risk of `innerHTML` does not arise.

## Styling

```jsx
<p className="warning">Careful</p>
<p style={{ color: "teal", fontSize: 18 }}>Styled directly</p>
```

`style` takes an object, hence the double braces: the outer pair means "JavaScript here", the inner pair is the object. Property names are camelCase.

## How the exercises work

Every React exercise has a component file for you to complete, a test file you can read, and a small page that shows your component.

- **Run tests** renders your component in a simulated browser and checks what appears.
- **Start app** opens it in a real browser tab, updating as you save.

They use the React package set. Download it once from the Setup page.

## Common mistakes

- **A lower-case component name.** `<header />` is the HTML element. `<Header />` is your component.
- **Two root elements.** Wrap them in `<>...</>`.
- **`class` in place of `className`.**
- **An unclosed tag** such as `<br>`.
- **Forgetting `export`**, so nothing else can import the component.
