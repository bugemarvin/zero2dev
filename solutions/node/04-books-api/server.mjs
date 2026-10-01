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

function validate(body) {
  const fields = {};
  if (typeof body.title !== "string" || body.title.trim() === "") {
    fields.title = "title is required";
  }
  if (typeof body.author !== "string" || body.author.trim() === "") {
    fields.author = "author is required";
  }
  if (!Number.isInteger(body.year)) {
    fields.year = "year must be a whole number";
  }
  return fields;
}

function findBook(req) {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    throw new HttpError(404, "not found");
  }
  return book;
}

const app = express();
app.use(express.json());

app.get("/books", (req, res) => {
  let items = books;
  if (typeof req.query.author === "string") {
    const wanted = req.query.author.toLowerCase();
    items = items.filter((b) => b.author.toLowerCase() === wanted);
  }
  if (req.query.sort === "year") {
    items = [...items].sort((a, b) => a.year - b.year);
  } else if (req.query.sort === "-year") {
    items = [...items].sort((a, b) => b.year - a.year);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  res.json({ items: items.slice(offset, offset + limit), total: items.length, limit, offset });
});

app.get("/books/:id", (req, res) => {
  res.json(findBook(req));
});

app.post("/books", (req, res) => {
  const body = req.body ?? {};
  const fields = validate(body);
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }
  const book = { id: nextId++, title: body.title.trim(), author: body.author.trim(), year: body.year };
  books.push(book);
  res.status(201).location(`/books/${book.id}`).json(book);
});

app.delete("/books/:id", (req, res) => {
  const book = findBook(req);
  books = books.filter((b) => b !== book);
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON" });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  res.status(500).json({ error: "internal error" });
});

app.listen(process.env.PORT || 3000);
