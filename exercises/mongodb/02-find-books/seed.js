db.books.insertMany([
  { _id: 1, title: "Dune", author: "Frank Herbert", year: 1965, price: 12.5, tags: ["sf", "classic"], stock: { shop: 4, warehouse: 20 } },
  { _id: 2, title: "Neuromancer", author: "William Gibson", year: 1984, price: 9.0, tags: ["sf", "cyberpunk"], stock: { shop: 0, warehouse: 7 } },
  { _id: 3, title: "Emma", author: "Jane Austen", year: 1815, price: 7.25, tags: ["classic", "romance"], stock: { shop: 2, warehouse: 0 } },
  { _id: 4, title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, price: 10.0, tags: ["fantasy", "classic"], stock: { shop: 6, warehouse: 31 } },
  { _id: 5, title: "Snow Crash", author: "Neal Stephenson", year: 1992, price: 14.0, tags: ["sf", "cyberpunk"], stock: { shop: 1, warehouse: 3 } },
  { _id: 6, title: "Foundation", author: "Isaac Asimov", year: 1951, price: 8.5, tags: ["sf", "classic"], stock: { shop: 3, warehouse: 12 } },
  { _id: 7, title: "Persuasion", author: "Jane Austen", year: 1817, price: 6.75, tags: ["classic", "romance"], stock: { shop: 0, warehouse: 0 } },
  { _id: 8, title: "The Martian", author: "Andy Weir", year: 2011, price: 15.5, tags: ["sf"], stock: { shop: 9, warehouse: 40 } }
]);
