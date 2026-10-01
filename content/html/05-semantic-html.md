---
title: Semantic HTML and accessibility
summary: Mark up the parts of a page by what they are, so every visitor and every tool can use it.
---

## The div problem

`<div>` is a box with no meaning. A page built only from divs looks fine and tells nobody anything:

```html
<div class="top">...</div>
<div class="menu">...</div>
<div class="content">...</div>
<div class="bottom">...</div>
```

HTML has elements that say what each part is:

```html
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>
```

They look exactly the same. The difference is for everything that reads the page without seeing it: screen readers, search engines, reader mode, browser extensions.

## The landmark elements

| Element | Meaning |
| --- | --- |
| `<header>` | the introduction of the page, or of a section: logo, title |
| `<nav>` | a block of navigation links |
| `<main>` | the main content. **One per page.** |
| `<article>` | something that stands alone and could be shared by itself: a blog post, a product card, a comment |
| `<section>` | a part of the page with its own heading |
| `<aside>` | related, but not part of the main flow: a sidebar, a note |
| `<footer>` | closing information: copyright, contact links |

A screen reader user can jump straight to "main" or list all navigation blocks. That is the keyboard equivalent of glancing at a page.

## A complete page

```html
<body>
  <header>
    <h1>Sam's blog</h1>
    <nav>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h2>Why I like HTML</h2>
      <p>Because it never crashes.</p>
    </article>
  </main>

  <footer>
    <p>Written by Sam.</p>
  </footer>
</body>
```

When does `div` remain correct? When you need a box only for styling and no element with a meaning fits. `span` is the same for a piece of text inside a line.

## The four rules of accessible HTML

Accessibility means the page works for people who cannot see it, cannot use a mouse, or use it in ways you did not think of. Most of it is free if the HTML is right.

1. **Use the element that does the job.** A `<button>` can be reached with the Tab key and pressed with Enter and Space. A `<div>` with a click handler cannot.
2. **Every image has an `alt`.** Every form field has a `label`.
3. **Headings form an outline.** `h1`, then `h2`, then `h3`, with no gaps.
4. **Links and buttons say what they do.** "Read the pricing guide", not "Click here".

Test your page in one minute: put the mouse away and use only the Tab key. Can you reach and use everything, and can you see where you are?

## Buttons and links

- A **link** goes somewhere: `<a href="...">`.
- A **button** does something: `<button type="button">`.

Do not swap them, and do not build either out of a `div`.

## Common mistakes

- **A `div` for everything.**
- **More than one `main`**, or `main` inside `header` or `footer`.
- **A `section` with no heading.** If it has no heading, it is probably a `div`.
- **Clickable `div` and `span` elements.**
- **Heading levels chosen for their size.**
