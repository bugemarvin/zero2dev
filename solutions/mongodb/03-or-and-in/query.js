const result = {
  cheapOrNew: db.books.countDocuments({ $or: [{ price: { $lt: 8 } }, { year: { $gt: 2000 } }] }),
  austenTitles: db.books
    .find({ author: { $in: ["Jane Austen", "Andy Weir"] } })
    .sort({ title: 1 })
    .toArray()
    .map((book) => book.title),
  tags: db.books.distinct("tags").sort(),
};
