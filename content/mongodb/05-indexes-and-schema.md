---
title: Indexes and schema design
summary: Keep queries fast, enforce rules, and decide what to store together.
---

## Without an index

To answer `find({ email: "ada@example.com" })` with no index, MongoDB reads **every document** in the collection. That is a **collection scan**. It is fine for a thousand documents and a disaster for ten million.

An **index** is a sorted structure of the values of one or more fields, each pointing at its document. Finding a value in it takes a handful of steps, whatever the size of the collection.

```javascript
db.users.createIndex({ email: 1 });
```

Every collection has an index on `_id` already.

## Checking with explain

```javascript
db.users.find({ email: "ada@example.com" }).explain("executionStats");
```

Look for two things in the output:

| Field | Good | Bad |
| --- | --- | --- |
| the stage of the winning plan | `IXSCAN` (index scan) | `COLLSCAN` (collection scan) |
| `totalDocsExamined` | close to the number of results | the size of the collection |

## Unique indexes

An index can also enforce a rule: no two documents with the same value.

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
```

A second user with the same email is now rejected with a "duplicate key" error. Checking in your application first ("is this email taken?") is not enough: two sign-ups at the same moment both see "no". Only the database can guarantee it.

## Compound indexes

An index on several fields serves queries that filter on them **from left to right**:

```javascript
db.orders.createIndex({ customer: 1, date: -1 });
```

| Query | Uses the index? |
| --- | --- |
| `find({ customer: "ada" })` | yes |
| `find({ customer: "ada" }).sort({ date: -1 })` | yes, including the sort |
| `find({ date: "2025-01-04" })` | no: `date` is not the first field |

Rule of thumb for the order of the fields: **equality** fields first, then the **sort** field, then **range** fields.

## Indexes are not free

Every index takes memory and must be updated on every insert, update and delete. Index what your real queries need, and remove what nothing uses:

```javascript
db.orders.getIndexes();
db.orders.dropIndex("customer_1_date_-1");
```

Other kinds worth knowing: a **TTL index** deletes documents after a time (sessions, logs), and a **text index** searches words.

## Embed or reference?

The central design question in MongoDB: store related data **inside** a document, or in **another collection** with an id pointing to it?

```javascript
// embedded: the lines live inside the order
{ _id: 1, customer: "ada", lines: [{ sku: "mug", quantity: 2 }] }

// referenced: the order points at a customer document
{ _id: 1, customerId: 42, lines: [...] }
```

| Embed when | Reference when |
| --- | --- |
| the data is read together with its parent | the data is used on its own, or by many parents |
| it belongs to exactly one parent | it changes often and is repeated in many places |
| the list is small and bounded | the list can grow without limit |

Order lines are embedded: they are meaningless without their order, and there are a handful of them. The comments of a popular post are referenced: there may be a hundred thousand.

The guiding principle: **data that is used together is stored together.** Design the documents from the queries your application makes, not from the shape of the data alone. This is the reverse of relational design, where you normalise first and write queries afterwards.

## Copying data on purpose

Storing the customer's name inside each order (as well as in `customers`) saves a lookup on every read. The cost: when the name changes, old orders still show the old one. For an order that is often correct, because it records what was true when it was placed. For other data it is a bug. Decide case by case.

## Validation

A collection can reject documents that break the rules:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      required: ["email", "name"],
      properties: {
        email: { bsonType: "string" },
        age: { bsonType: "int", minimum: 0 },
      },
    },
  },
});
```

"Schemaless" means the database does not force a schema on you. It does not mean you should have none.

## Common mistakes

- **No index on a field you filter by**, noticed only when the collection has grown.
- **An index on every field.** Writes become slow and memory fills up.
- **A compound index in the wrong order.**
- **Unbounded arrays** inside a document.
- **Designing collections like SQL tables**, then joining everything with `$lookup`.
