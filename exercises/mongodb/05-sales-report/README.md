# A sales report

The collection `orders` has six orders. Each has a `customer`, a `status` and an array `lines` with a `sku`, a `quantity` and a `price` per piece.

Build one aggregation pipeline and put its result in `result`:

1. Keep only the orders whose `status` is `"paid"`.
2. Unwind the `lines`.
3. Group by customer. For each one compute `spent`: the sum of quantity times price over all lines, and `items`: the sum of the quantities.
4. Sort by `spent`, highest first.

Each result document has exactly three fields: `_id` (the customer), `spent` and `items`.

Write your commands in `query.js`. **Show result** runs the file on the sample data and prints `result`. Each run starts from a fresh copy of the data, so you can experiment freely.
