---
title: Grid
summary: Rows and columns at the same time: page layouts and card grids.
---

## Two dimensions

Flexbox handles a row **or** a column. **Grid** handles rows **and** columns together. Use it for page layouts and for anything that should line up in both directions.

```css
.cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}
```

Three columns of equal width. The children fill the cells from left to right, and new rows appear as needed.

## The fr unit

`fr` is a **fraction of the free space**.

| Declaration | Result |
| --- | --- |
| `grid-template-columns: 1fr 1fr` | two equal columns |
| `grid-template-columns: 240px 1fr` | a 240px sidebar, and the rest |
| `grid-template-columns: 1fr 2fr` | the second is twice as wide as the first |
| `grid-template-columns: repeat(4, 1fr)` | four equal columns |

## Placing items

By default each child takes one cell. An item can span several:

```css
.wide { grid-column: span 2; }          /* two columns wide */
.banner { grid-column: 1 / -1; }        /* from the first line to the last: the full width */
.tall { grid-row: span 2; }
```

Grid lines are numbered from 1. `-1` is the last line.

## Named areas

For a page layout, drawing it is clearer than counting lines:

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 1rem;
}

.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }
```

Each string is a row, and each word a cell. A name repeated across cells makes one item span them.

## A responsive grid in one line

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
```

Read it as: "as many columns as fit, each at least 220px, sharing the rest equally". On a phone that is one column, on a laptop four, and you wrote no media query.

## Alignment

The same words as in flexbox, for both directions:

| Property | Aligns |
| --- | --- |
| `justify-items` | items inside their cells, horizontally |
| `align-items` | items inside their cells, vertically |
| `place-items: center` | both at once |

## Grid or flexbox?

- Items in **one line** that should share space or wrap: **flexbox**.
- A layout with **rows and columns** that must line up: **grid**.

They combine well: a grid for the page, flexbox inside the header.

## Common mistakes

- **Counting columns when you mean lines.** Three columns have four lines.
- **Fixed pixel columns** that overflow a small screen. Use `fr` and `minmax`.
- **Forgetting `gap`** and adding margins to every item.
- **A typo in an area name.** The whole `grid-template-areas` declaration is then ignored.
