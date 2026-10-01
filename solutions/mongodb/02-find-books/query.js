const result = db.books
  .find({ tags: "sf", price: { $lt: 14 }, "stock.shop": { $gt: 0 } }, { title: 1, price: 1, _id: 0 })
  .sort({ price: -1 });
