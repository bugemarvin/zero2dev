# Update the stock

Change the `books` collection with update commands. You do not need a `result` variable.

1. One copy of the book with `_id` 1 is sold in the shop: lower its `stock.shop` by 1 with `$inc`.
2. Every book with the tag `classic` gets 2 added to its `price`.
3. Add the tag `bestseller` to book 8 with `$addToSet`. Run the same command **twice**: the tag must appear only once.
4. Remove the tag `cyberpunk` from every book that has it.
5. Count views with an upsert: run this exact update **three times**. The first run must create the document.

```javascript
db.views.updateOne({ _id: "book:8" }, { $inc: { count: 1 } }, { upsert: true });
```

6. Delete the books that have no stock at all: `stock.shop` is 0 **and** `stock.warehouse` is 0.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
