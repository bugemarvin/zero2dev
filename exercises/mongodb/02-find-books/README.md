# Find books

The collection `books` has eight documents. Look at them first: write `const result = db.books.find();` and press **Show result**.

Then set `result` to:

- the books that have the tag `sf`
- **and** cost less than 14
- **and** have at least one copy in the shop (`stock.shop` greater than 0)

Return only `title` and `price`, without `_id`, sorted by price from high to low.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
