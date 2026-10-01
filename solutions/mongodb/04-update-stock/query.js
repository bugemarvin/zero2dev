db.books.updateOne({ _id: 1 }, { $inc: { "stock.shop": -1 } });

db.books.updateMany({ tags: "classic" }, { $inc: { price: 2 } });

db.books.updateOne({ _id: 8 }, { $addToSet: { tags: "bestseller" } });
db.books.updateOne({ _id: 8 }, { $addToSet: { tags: "bestseller" } });

db.books.updateMany({ tags: "cyberpunk" }, { $pull: { tags: "cyberpunk" } });

for (let i = 0; i < 3; i++) {
  db.views.updateOne({ _id: "book:8" }, { $inc: { count: 1 } }, { upsert: true });
}

db.books.deleteMany({ "stock.shop": 0, "stock.warehouse": 0 });
