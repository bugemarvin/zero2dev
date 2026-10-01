db.users.insertMany([
  { _id: 1, email: "ada@example.com", name: "Ada" },
  { _id: 2, email: "sam@example.com", name: "Sam" }
]);
db.orders.insertMany([
  { _id: 1, customer: "ada", date: "2025-01-04", total: 33.0 },
  { _id: 2, customer: "sam", date: "2025-01-09", total: 40.0 },
  { _id: 3, customer: "ada", date: "2025-02-11", total: 9.0 }
]);
