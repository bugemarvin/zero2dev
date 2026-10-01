---
title: The structure of a page
summary: Elements, attributes, and the skeleton that every HTML page shares.
---

## What HTML is

A web page is a text file. **HTML** (HyperText Markup Language) marks up that text so the browser knows what each part *is*: a heading, a paragraph, a link, an image. HTML says nothing about colours or layout. That is the job of [CSS](css/01-selectors-and-cascade).

Create a file named `index.html`, put this in it, and open it in a browser:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My first page</title>
</head>
<body>
  <h1>Hello, web</h1>
  <p>This is a paragraph.</p>
</body>
</html>
```

You do not need a server or any tool. A browser opens the file directly.

## Elements and tags

```html
<p>This is a paragraph.</p>
```

- `<p>` is the **opening tag**, `</p>` the **closing tag**.
- Everything from the opening tag to the closing tag is one **element**.
- Elements nest inside each other, like boxes inside boxes. Close them in the reverse order you opened them:

```html
<p>Read the <strong>whole</strong> page.</p>
```

A few elements have no content and no closing tag: `<br>`, `<img>`, `<meta>`, `<input>`, `<hr>`. They are called **void elements**.

## Attributes

An attribute gives an element extra information. It goes in the opening tag, as `name="value"`:

```html
<html lang="en">
<a href="https://example.com">A link</a>
```

Always put quotes around the value.

## The skeleton

| Part | Purpose |
| --- | --- |
| `<!doctype html>` | tells the browser this is modern HTML. Always the first line. |
| `<html lang="en">` | the root of the page. `lang` tells screen readers and translators the language. |
| `<head>` | information *about* the page. Nothing in it is shown in the page itself. |
| `<meta charset="utf-8">` | the text encoding. Without it, letters such as é and symbols can show as garbage. |
| `<title>` | the text on the browser tab, in bookmarks and in search results |
| `<body>` | everything the visitor sees |

Add this line to the head of every page, so phones show it at a readable size:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Headings and paragraphs

```html
<h1>The main title of the page</h1>
<h2>A section</h2>
<h3>A sub-section</h3>
<p>Text goes in paragraphs.</p>
```

- There are six levels, `h1` to `h6`.
- Use **one `h1` per page**: it says what the page is about.
- Do not skip levels to get a smaller font. Headings are an outline, like the chapters of a book. Size is changed with CSS.

The browser ignores line breaks and repeated spaces in your file. To start a new paragraph you need a new `<p>`.

## Comments

```html
<!-- This note is for people reading the source. The browser does not show it. -->
```

## Looking at any page

Every browser can show you the HTML of the page you are on. Press F12, or right-click and choose **Inspect**. The **Elements** tab shows the page as a tree of elements. This is the most useful tool in web development, and it works on every site.

## Common mistakes

- **Forgetting the closing tag.** The browser guesses, and the guess is often not what you meant.
- **Closing tags in the wrong order**: `<p><strong>text</p></strong>`.
- **No doctype.** The browser switches to an old compatibility mode and layout breaks in strange ways.
- **Several `h1` elements**, or picking a heading level for its size.
- **Text directly in `<body>`** with no element around it.
