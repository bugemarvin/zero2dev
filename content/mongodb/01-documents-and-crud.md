---
title: Documents and CRUD
summary: What a document database is, and the four basic operations.
---

## Documents, not rows

A relational database stores **rows** in **tables** with fixed columns. MongoDB stores **documents** in **collections**. A document looks like JSON:

```javascript
{
  _id: 1,
  title: "Dune",
  author: "Frank Herbert",
  year: 1965,
  tags: ["sf", "classic"],
  stock: { shop: 4, warehouse: 20 }
}
```

| SQL | MongoDB |
| --- | --- |
| database | database |
| table | collection |
| row | document |
| column | field |
| primary key | the `_id` field |

Two things are different from a table:

- A field can hold a **list** or another **document**. Data that belongs together is stored together, with no join.
- Documents in one collection need not have the same fields. The schema is flexible, and it is your application that keeps it sensible.

When is this a good fit? When your data is naturally a tree (a blog post with its comments, an order with its lines), when the shape varies from item to item, or when you need to spread data over many servers. When your data is many-to-many relationships that you query in every direction, [a relational database](sql/01-select) is the better tool.

## The shell

`mongosh` is MongoDB's shell. It is a JavaScript prompt with a `db` object:

```console
$ mongosh
test> use shop
shop> db.books.find()
```

- `use shop` switches to the database `shop`. It is created when you first store something.
- `db.books` is the collection `books`. It also appears on first use.

The app starts MongoDB for you: on the Setup page, or with `python3 check.py services up mongodb`. Connect to it with `mongosh --port 27170`, or without installing anything: `docker exec -it z2d-mongodb mongosh`.

## Create

```javascript
db.books.insertOne({ title: "Dune", year: 1965 });

db.books.insertMany([
  { title: "Emma", year: 1815 },
  { title: "Foundation", year: 1951 },
]);
```

Every document gets an `_id`. If you do not give one, MongoDB creates an `ObjectId`, a 12-byte value that is unique and roughly ordered by time. Two documents in a collection can never share an `_id`.

## Read

```javascript
db.books.find();                        // every document
db.books.find({ year: 1965 });          // those where year is 1965
db.books.find({ year: 1965, title: "Dune" });   // both conditions
db.books.findOne({ title: "Dune" });    // the first match, or null
db.books.countDocuments({ year: 1965 });
```

The first argument is a **filter**: a document that describes what you are looking for.

`find` returns a **cursor**, which hands out results in batches. In a script, `.toArray()` collects them into an array.

## Update

```javascript
db.books.updateOne(
  { title: "Dune" },                  // which document
  { $set: { price: 12.5 } }           // what to change
);
```

`$set` changes the named fields and leaves the rest alone. Without an operator such as `$set` the command is rejected, which protects you from replacing a whole document by accident. `updateMany` changes every match.

## Delete

```javascript
db.books.deleteOne({ title: "Emma" });
db.books.deleteMany({ year: { $lt: 1900 } });
```

`deleteMany({})` with an empty filter deletes **everything** in the collection.

## Choosing fields and order

```javascript
db.books.find({}, { title: 1, year: 1, _id: 0 })    // projection: only these fields
        .sort({ year: -1 })                         // 1 ascending, -1 descending
        .limit(3);
```

In a projection, `1` includes a field. `_id` is included unless you write `_id: 0`.

## Common mistakes

- **An update with no operator**, intending to change one field.
- **An empty filter on `deleteMany` or `updateMany`.** Run the same filter with `find` first and look at what it matches.
- **Inconsistent field names** such as `userName` in one document and `username` in another. Nothing stops you, and queries silently miss documents.
- **Expecting `find` to return an array.** It is a cursor.
