---
title: Tables
summary: Rows and columns for data, with headers that say what each cell means.
---

## When to use a table

A table is for **data that has rows and columns**: a price list, a timetable, results. It is not a tool for placing things on the page. Layout is done with CSS.

## Rows and cells

```html
<table>
  <tr>
    <th>Plan</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>Basic</td>
    <td>$5</td>
  </tr>
  <tr>
    <td>Pro</td>
    <td>$12</td>
  </tr>
</table>
```

| Element | Meaning |
| --- | --- |
| `<table>` | the whole table |
| `<tr>` | one row |
| `<th>` | a header cell: it labels a row or a column |
| `<td>` | a data cell |

A table is written row by row. Columns exist only because every row has the same number of cells.

## Caption, head and body

```html
<table>
  <caption>Monthly prices</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Basic</th>
      <td>$5</td>
    </tr>
    <tr>
      <th scope="row">Pro</th>
      <td>$12</td>
    </tr>
  </tbody>
</table>
```

- `<caption>` is the title of the table. It is the first thing inside `<table>`.
- `<thead>` holds the header rows, `<tbody>` the data, and an optional `<tfoot>` the totals.
- `scope="col"` says a header labels its column. `scope="row"` says it labels its row.

With these in place, a screen reader can say "Pro, Price, 12 dollars" when the user moves to a cell. Without them it reads a stream of unrelated words.

## Cells that span

```html
<td colspan="2">Spans two columns</td>
<td rowspan="3">Spans three rows</td>
```

When a cell spans, the row has fewer cells written in it. Count them carefully.

## A table has no lines by default

The browser draws no borders. They come from CSS:

```css
table { border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
```

Do not use old attributes such as `border="1"` or `cellpadding`. Looks belong in CSS.

## Common mistakes

- **Using a table for page layout.**
- **Using `td` for headers** and making them bold. Use `th`.
- **Rows with different numbers of cells**, which shifts the columns.
- **No caption**, so nobody knows what the numbers are.
