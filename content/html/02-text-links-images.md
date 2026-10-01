---
title: Text, links, images and lists
summary: The elements that make up most of every page.
---

## Meaning, not looks

Choose an element for what the text **means**. A browser, a search engine and a screen reader all use that meaning.

| Element | Meaning | Default look |
| --- | --- | --- |
| `<em>` | emphasis: you would stress the word when speaking | italic |
| `<strong>` | importance: a warning, a key point | bold |
| `<code>` | a piece of code | monospace |
| `<blockquote>` | a quotation from elsewhere | indented |
| `<br>` | a line break inside a paragraph, for addresses and poems | |

```html
<p>Save your work <strong>before</strong> you close the editor. I <em>really</em> mean it.</p>
```

## Links

The `a` element (anchor) makes text clickable. The `href` attribute says where it goes.

```html
<a href="https://developer.mozilla.org">MDN, the web reference</a>
<a href="contact.html">Contact</a>
<a href="#hobbies">Jump to my hobbies</a>
<a href="mailto:sam@example.com">Email me</a>
```

There are three kinds of address:

| Kind | Example | Goes to |
| --- | --- | --- |
| absolute | `https://example.com/about` | another site. It starts with `https://`. |
| relative | `contact.html`, `images/cat.jpg`, `../index.html` | a file of your own site, found from the current page |
| fragment | `#hobbies` | the element on this page with `id="hobbies"` |

Use **relative** addresses inside your own site. Then the site keeps working when you move it to another domain or open it from your disk.

The link text should say where the link goes. "Click here" tells a visitor nothing when links are read out of context.

## Images

```html
<img src="images/cat.jpg" alt="A grey cat asleep on a keyboard" width="400" height="300">
```

- `src` is the address of the image file.
- `alt` is the text used when the image cannot be seen: by screen readers, when the file fails to load, and by search engines. Describe what the image shows.
- For an image that is pure decoration, write `alt=""`. The attribute is still there, and empty on purpose.
- `width` and `height` let the browser reserve the space before the image arrives, so the page does not jump.

## Lists

An **unordered list** for items with no order, an **ordered list** for steps:

```html
<ul>
  <li>Milk</li>
  <li>Bread</li>
</ul>

<ol>
  <li>Boil the water</li>
  <li>Add the pasta</li>
</ol>
```

Only `li` elements go directly inside `ul` and `ol`. A list can go inside an `li` to make a nested list.

A navigation menu is a list of links:

```html
<nav>
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
  </ul>
</nav>
```

## id and class

Two attributes work on every element:

```html
<h2 id="hobbies">Hobbies</h2>
<p class="note warning">Two classes, separated by a space.</p>
```

- An `id` is unique on the page. It is the target of `#hobbies` links.
- A `class` can be used on many elements. CSS uses it to style them.

## Special characters

`<` and `&` have a meaning in HTML. To show them as text, write `&lt;` and `&amp;`. `&gt;` is `>`, and `&nbsp;` is a space that does not wrap.

## Common mistakes

- **No `alt` on an image.**
- **`href` with a Windows path** such as `C:\site\about.html`. It works only on your machine.
- **A link written as an absolute address to your own site**, which breaks when the domain changes.
- **Using `<br><br>` to separate paragraphs** in place of `<p>`.
- **Using `<b>` and `<i>`** where `<strong>` and `<em>` carry the meaning.
