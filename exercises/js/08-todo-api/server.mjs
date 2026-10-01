import express from "express";

const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

app.get("/todos", (req, res) => {
  res.json(todos);
});

// add the other routes here

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
