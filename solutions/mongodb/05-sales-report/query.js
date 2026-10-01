const result = db.orders.aggregate([
  { $match: { status: "paid" } },
  { $unwind: "$lines" },
  {
    $group: {
      _id: "$customer",
      spent: { $sum: { $multiply: ["$lines.quantity", "$lines.price"] } },
      items: { $sum: "$lines.quantity" },
    },
  },
  { $sort: { spent: -1 } },
]);
