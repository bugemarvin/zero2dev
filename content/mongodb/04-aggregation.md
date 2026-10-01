---
title: The aggregation pipeline
summary: Group, summarise and reshape documents, one stage at a time.
---

## A pipeline

`find` returns documents as they are. To count, sum, group or reshape, MongoDB has the **aggregation pipeline**: a list of **stages**. Documents flow through them, and each stage changes the stream.

```javascript
db.orders.aggregate([
  { $match: { status: "paid" } },                              // keep some documents
  { $group: { _id: "$customer", orders: { $sum: 1 } } },       // one document per customer
  { $sort: { orders: -1 } },                                   // order the groups
]);
```

It is the same idea as a shell pipeline, or as `WHERE`, `GROUP BY` and `ORDER BY` in SQL.

| Stage | Does | SQL |
| --- | --- | --- |
| `$match` | keeps documents that fit a filter | `WHERE`, `HAVING` |
| `$group` | combines documents into groups | `GROUP BY` |
| `$sort` | orders | `ORDER BY` |
| `$limit`, `$skip` | takes or skips some | `LIMIT`, `OFFSET` |
| `$project` | chooses and computes fields | the `SELECT` list |
| `$addFields` | adds computed fields, keeps the rest | |
| `$unwind` | turns each array element into its own document | |
| `$lookup` | fetches matching documents from another collection | `LEFT JOIN` |
| `$count` | counts the documents so far | `COUNT(*)` |

## Field references

Inside a pipeline, a string that starts with `$` means "the value of this field": `"$customer"`, `"$lines.price"`.

## $group

```javascript
{ $group: {
    _id: "$customer",                 // the key to group by
    orders: { $sum: 1 },              // count
    spent: { $sum: "$total" },        // add up a field
    biggest: { $max: "$total" },
    average: { $avg: "$total" },
} }
```

- `_id` is what makes a group. `_id: null` puts everything in one group.
- The other fields use **accumulators**: `$sum`, `$avg`, `$min`, `$max`, `$first`, `$last`, `$push` (collect into an array), `$addToSet`.

## $unwind

An order has an array of lines. To total by product, each line must become a document of its own:

```javascript
db.orders.aggregate([
  { $unwind: "$lines" },
  { $group: { _id: "$lines.sku", sold: { $sum: "$lines.quantity" } } },
]);
```

After `$unwind`, an order with three lines has become three documents, each with one `lines` document.

## Computing with $project and $addFields

```javascript
{ $addFields: { amount: { $multiply: ["$lines.quantity", "$lines.price"] } } }

{ $project: { _id: 0, customer: "$_id", spent: { $round: ["$spent", 2] } } }
```

Expressions include `$add`, `$subtract`, `$multiply`, `$divide`, `$round`, `$concat`, `$toUpper`, `$size` (length of an array) and `$cond` (if-then-else).

## $lookup: a join

```javascript
db.orders.aggregate([
  { $lookup: {
      from: "customers",          // the other collection
      localField: "customer",     // a field of orders
      foreignField: "_id",        // the matching field of customers
      as: "customerInfo",         // the new array field
  } },
]);
```

The result is an **array** of the matches, possibly empty. If you need `$lookup` in most of your queries, the data may be better stored together, or in a relational database.

## Order matters

- Put `$match` **first**. It can use an index, and every later stage has fewer documents to process.
- `$sort` then `$limit` gives the "top N".
- A `$match` after `$group` filters the groups, like `HAVING`.

## Common mistakes

- **Forgetting the `$`** in a field reference: `_id: "customer"` groups everything under the literal text "customer".
- **Grouping before filtering**, which processes documents that are then thrown away.
- **`$unwind` on a large array without a `$match` first**, multiplying the number of documents.
- **Doing in application code** what one pipeline does on the server: fetching everything and looping.
