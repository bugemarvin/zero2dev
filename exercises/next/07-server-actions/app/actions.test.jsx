// Tests. Do not edit.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { revalidatePath } from "next/cache";
import { createTodo, removeTodo } from "./actions.js";
import TodosPage from "./todos/page.jsx";
import { addTodo, listTodos, resetTodos } from "../lib/todos.js";

const form = (fields) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const firstStatement = (file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "").trim().split("\n")[0].trim();

beforeEach(() => {
  resetTodos();
  revalidatePath.mockClear();
});

test("actions.js starts with the \"use server\" directive", () => {
  expect(firstStatement("app/actions.js")).toMatch(/^["']use server["'];?$/);
});

test("createTodo adds a trimmed todo and revalidates /todos", async () => {
  const result = await createTodo(form({ title: "  Buy milk  " }));
  expect(result).toEqual({ ok: true });
  expect(listTodos()).toEqual([{ id: 1, title: "Buy milk" }]);
  expect(revalidatePath).toHaveBeenCalledWith("/todos");
});

test("createTodo rejects an empty title", async () => {
  expect(await createTodo(form({ title: "   " }))).toEqual({ error: "A title is required." });
  expect(await createTodo(form({}))).toEqual({ error: "A title is required." });
  expect(listTodos()).toEqual([]);
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("createTodo rejects a title longer than 50 characters", async () => {
  expect(await createTodo(form({ title: "x".repeat(51) }))).toEqual({ error: "A title can have at most 50 characters." });
  expect(listTodos()).toEqual([]);
  expect(await createTodo(form({ title: "x".repeat(50) }))).toEqual({ ok: true });
});

test("removeTodo deletes the todo and revalidates", async () => {
  addTodo("one");
  addTodo("two");
  expect(await removeTodo(1)).toEqual({ ok: true });
  expect(listTodos()).toEqual([{ id: 2, title: "two" }]);
  expect(revalidatePath).toHaveBeenCalledWith("/todos");
});

test("removeTodo reports an unknown id", async () => {
  expect(await removeTodo(99)).toEqual({ error: "No such todo." });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("the page has a form with a title field and an Add button", async () => {
  const html = renderToStaticMarkup(await TodosPage());
  expect(html).toContain("<form");
  expect(html).toMatch(/<input[^>]*name="title"/);
  expect(html).toMatch(/<button[^>]*>Add<\/button>/);
});

test("the page lists the todos", async () => {
  addTodo("Learn Next.js");
  addTodo("Ship it");
  const html = renderToStaticMarkup(await TodosPage());
  expect(html).toContain("<li>Learn Next.js</li>");
  expect(html).toContain("<li>Ship it</li>");
});

test("the form's action is createTodo", () => {
  expect(readFileSync("app/todos/page.jsx", "utf8")).toMatch(/action=\{\s*createTodo\s*\}/);
});
