---
title: Nesting and the parent selector
summary: Write rules inside rules, the way the HTML is nested, without overdoing it.
---

## Nesting

In CSS, rules for one component repeat its name on every line:

```css
.nav { display: flex; }
.nav a { color: #333; }
.nav a:hover { text-decoration: underline; }
```

In Sass you write the inner rules **inside** the outer one:

```scss
.nav {
  display: flex;

  a {
    color: #333;
  }
}
```

It compiles to exactly the CSS above: `.nav` and `.nav a`. Everything that belongs to the component sits in one block.

## The parent selector: &

Inside a nested block, `&` stands for the **selector of the parent**. It is how you attach something to the parent with no space in between:

```scss
a {
  color: #333;

  &:hover {              // a:hover
    text-decoration: underline;
  }

  &.active {             // a.active
    font-weight: bold;
  }
}
```

Without the `&`, a nested `:hover` would compile to `a :hover`, with a space: any hovered element **inside** a link. That is almost never what you mean.

## & builds names

`&` can also be the start of a longer class name. That fits naming schemes such as **BEM** (block, element, modifier), where a card has `card__title` and `card--featured`:

```scss
.card {
  padding: 16px;

  &__title {             // .card__title
    font-size: 1.25rem;
  }

  &--featured {          // .card--featured
    border-color: gold;
  }
}
```

The compiled selectors are flat single classes, which keeps specificity low.

## & at the end

`&` can come last, to style something depending on where it sits:

```scss
.button {
  .dark-theme & {        // .dark-theme .button
    background: #222;
  }
}
```

## Nesting properties and media queries

A media query can be written inside the rule it belongs to. Sass moves it out to the top level:

```scss
.sidebar {
  width: 100%;

  @media (min-width: 700px) {
    width: 240px;
  }
}
```

The base style and its responsive change are next to each other, which is where you want them when reading.

## Do not nest deeply

Nesting is easy to overdo:

```scss
.page {
  .content {
    .article {
      .header {
        h2 { color: navy; }     // .page .content .article .header h2
      }
    }
  }
}
```

That selector is slow to read, has a high specificity that is hard to override, and breaks when the HTML is rearranged. A good rule: **no more than three levels**, and nest only what really belongs to the parent.

Plain CSS now supports nesting too, with the same `&`. What you learn here carries over.

## Common mistakes

- **Forgetting `&`** before `:hover`, `.active` or `::before`.
- **Nesting to mirror the whole HTML tree.**
- **A nested rule that does not depend on its parent.** Write it at the top level.
- **Mixing BEM names and deep nesting**, which gives the worst of both.
