---
title: Updates
summary: Change part of a document: numbers, lists, nested fields, and insert-or-update.
---

## Update operators

```javascript
db.books.updateOne({ _id: 1 }, { $set: { price: 11.0 } });
```

| Operator | Does |
| --- | --- |
| `$set` | sets fields, creating them if they are missing |
| `$unset` | removes fields: `{ $unset: { subtitle: "" } }` |
| `$inc` | adds a number (negative to subtract) |
| `$mul` | multiplies |
| `$min`, `$max` | sets the field only if the new value is smaller, or larger |
| `$rename` | renames a field |
| `$currentDate` | sets the field to now |

Several operators fit in one update:

```javascript
db.books.updateOne(
  { _id: 1 },
  { $inc: { "stock.shop": -1 }, $set: { lastSold: new Date() } }
);
```

## Why $inc matters

Imagine two customers buy the last copies at the same moment. If your program reads the stock, subtracts one, and writes it back, both can read `4` and both write `3`. One sale is lost.

`$inc` is done **inside the database, as one step**. Two `$inc: -1` always end at `2`. Always let the database do the arithmetic.

You can even make the check part of the filter, so it only sells what exists:

```javascript
const outcome = db.books.updateOne(
  { _id: 1, "stock.shop": { $gt: 0 } },
  { $inc: { "stock.shop": -1 } }
);
// outcome.modifiedCount is 0 when the book was out of stock
```

## Arrays

| Operator | Does |
| --- | --- |
| `$push` | appends a value |
| `$addToSet` | appends it only if it is not there yet |
| `$pull` | removes every value that matches |
| `$pop` | removes the last (`1`) or first (`-1`) element |

```javascript
db.books.updateOne({ _id: 1 }, { $push: { tags: "bestseller" } });
db.books.updateOne({ _id: 1 }, { $addToSet: { tags: "sf" } });       // no duplicate
db.books.updateOne({ _id: 1 }, { $pull: { tags: "classic" } });
db.books.updateOne({ _id: 1 }, { $push: { tags: { $each: ["a", "b"] } } });
```

## Many documents

```javascript
db.books.updateMany({ tags: "classic" }, { $mul: { price: 0.9 } });
```

The result tells you what happened: `matchedCount` documents matched the filter, and `modifiedCount` were really changed.

## Upsert: update or insert

With `upsert: true`, a document is **created** when nothing matches:

```javascript
db.counters.updateOne(
  { _id: "page:/home" },
  { $inc: { views: 1 } },
  { upsert: true }
);
```

The first call creates `{ _id: "page:/home", views: 1 }`. Every later call adds one. There is no "check whether it exists" step, so there is no race.

## Replace

`replaceOne` swaps the whole document, keeping only the `_id`:

```javascript
db.books.replaceOne({ _id: 3 }, { title: "Emma", author: "Jane Austen" });
```

## Find and change in one step

`findOneAndUpdate` changes a document and returns it. That makes it the tool for claiming a job from a queue:

```javascript
const job = db.jobs.findOneAndUpdate(
  { status: "waiting" },
  { $set: { status: "running" } },
  { sort: { created: 1 }, returnDocument: "after" }
);
```

Two workers can never claim the same job.

## Common mistakes

- **Read, change in the program, write back.** Use `$inc`, `$push` and the other operators.
- **`$push` where `$addToSet` was meant**, filling an array with duplicates.
- **`updateOne` when many documents should change.** It stops at the first match.
- **Forgetting `upsert`** and wondering why nothing was created.
- **Arrays that grow for ever.** A document has a size limit of 16 MB, and huge arrays are slow long before that.
