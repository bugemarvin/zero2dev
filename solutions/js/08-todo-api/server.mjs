import express from "express";

const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

function findTodo(req) {
  const id = Number(req.params.id);
  return todos.find((todo) => todo.id === id);
}

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const title = req.body?.title;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }
  const todo = { id: nextId++, title: title.trim(), done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.get("/todos/:id", (req, res) => {
  const todo = findTodo(req);
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(todo);
});

app.patch("/todos/:id", (req, res) => {
  const todo = findTodo(req);
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  if (typeof req.body?.done === "boolean") {
    todo.done = req.body.done;
  }
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const todo = findTodo(req);
  if (!todo) {
    return res.status(404).json({ error: "not found" });
  }
  todos = todos.filter((t) => t !== todo);
  res.status(204).end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
