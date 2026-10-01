db.orders.insertMany([
  { _id: 1, customer: "ada", status: "paid", date: "2025-01-04", lines: [{ sku: "mug", quantity: 2, price: 9.0 }, { sku: "pen", quantity: 10, price: 1.5 }] },
  { _id: 2, customer: "sam", status: "paid", date: "2025-01-09", lines: [{ sku: "bag", quantity: 1, price: 40.0 }] },
  { _id: 3, customer: "ada", status: "cancelled", date: "2025-01-15", lines: [{ sku: "bag", quantity: 2, price: 40.0 }] },
  { _id: 4, customer: "kim", status: "paid", date: "2025-02-02", lines: [{ sku: "pen", quantity: 4, price: 1.5 }, { sku: "mug", quantity: 1, price: 9.0 }] },
  { _id: 5, customer: "ada", status: "paid", date: "2025-02-11", lines: [{ sku: "mug", quantity: 1, price: 9.0 }] },
  { _id: 6, customer: "sam", status: "paid", date: "2025-02-20", lines: [{ sku: "pen", quantity: 20, price: 1.5 }, { sku: "bag", quantity: 1, price: 40.0 }] }
]);
