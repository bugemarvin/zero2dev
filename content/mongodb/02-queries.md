---
title: Queries
summary: Find exactly the documents you want: comparisons, lists, nested fields and logic.
---

## Comparison operators

A filter such as `{ year: 1965 }` tests for equality. For anything else, the value is a document with an **operator**:

```javascript
db.books.find({ year: { $gt: 1950 } });
db.books.find({ price: { $gte: 8, $lte: 12 } });     // two conditions on one field
```

| Operator | Meaning |
| --- | --- |
| `$eq`, `$ne` | equal, not equal |
| `$gt`, `$gte` | greater than, greater or equal |
| `$lt`, `$lte` | less than, less or equal |
| `$in` | equal to any value of a list |
| `$nin` | equal to none of them |
| `$exists` | the field is present (`true`) or absent (`false`) |
| `$regex` | the text matches a pattern |

```javascript
db.books.find({ author: { $in: ["Jane Austen", "Andy Weir"] } });
db.books.find({ title: { $regex: "^The" } });        // titles starting with "The"
db.books.find({ subtitle: { $exists: false } });
```

## Logic

Several fields in one filter mean **and**:

```javascript
db.books.find({ year: { $gt: 1950 }, price: { $lt: 10 } });
```

For **or**, use `$or` with a list of filters:

```javascript
db.books.find({
  $or: [{ price: { $lt: 8 } }, { year: { $gt: 2000 } }],
});
```

## Nested fields

Reach into a nested document with a dot. The name then needs quotes:

```javascript
db.books.find({ "stock.shop": { $gt: 0 } });
```

## Arrays

A filter on an array field matches when **any element** matches:

```javascript
db.books.find({ tags: "sf" });                       // tags contains "sf"
db.books.find({ tags: { $all: ["sf", "classic"] } }); // contains both
db.books.find({ tags: { $size: 1 } });               // has exactly one element
```

For an array of documents, `$elemMatch` requires one element to satisfy several conditions together:

```javascript
db.orders.find({ lines: { $elemMatch: { sku: "A1", quantity: { $gte: 2 } } } });
```

## Projection, sort, skip, limit

```javascript
db.books.find({ tags: "sf" }, { title: 1, price: 1, _id: 0 })
        .sort({ price: -1, title: 1 })      // price descending, then title
        .skip(10)
        .limit(5);
```

- A projection either lists the fields to **include** (`1`) or the fields to **exclude** (`0`). You cannot mix them, except for `_id`.
- The order of the calls does not matter: MongoDB always sorts, then skips, then limits.

Paging with `skip` gets slower the deeper you go, because the server still walks over the skipped documents. For large collections, page by "greater than the last value seen".

## Counting and distinct values

```javascript
db.books.countDocuments({ tags: "sf" });
db.books.distinct("author");
db.books.distinct("tags");          // the distinct values across all the arrays
```

## null and missing

```javascript
db.books.find({ subtitle: null });      // matches a null value AND a missing field
```

Use `$exists` when you need to tell the two apart.

## Common mistakes

- **Forgetting the quotes** around a dotted name: `"stock.shop"`.
- **Writing the same field twice** in a filter. In JavaScript the second one replaces the first. Combine the conditions in one document: `{ price: { $gte: 8, $lte: 12 } }`.
- **Mixing include and exclude** in a projection.
- **A `$regex` without an anchor** on a large collection, which cannot use an index.
