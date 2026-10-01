import express from "express";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

let nextId = 4;
let books = [
  { id: 1, title: "Dune", author: "Frank Herbert", year: 1965 },
  { id: 2, title: "Emma", author: "Jane Austen", year: 1815 },
  { id: 3, title: "Persuasion", author: "Jane Austen", year: 1817 },
];

const app = express();
app.use(express.json());

app.get("/books", (req, res) => {
  // filter, sort and page here
  res.json({ items: books, total: books.length, limit: 20, offset: 0 });
});

// Add GET /books/:id, POST /books and DELETE /books/:id

// Add the handler for unknown paths, and the error handler, last

app.listen(process.env.PORT || 3000);
