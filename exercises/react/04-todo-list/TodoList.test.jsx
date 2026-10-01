// Tests. Do not edit.
import { render, screen, fireEvent } from "@testing-library/react";
import TodoList from "./TodoList.jsx";

const todos = () => [
  { id: 1, title: "Learn React", done: false },
  { id: 2, title: "Build something", done: true },
  { id: 3, title: "Ship it", done: false },
];

test("an empty list shows a message and no list", () => {
  const { container } = render(<TodoList initialTodos={[]} />);
  expect(screen.getByText("Nothing to do.").tagName).toBe("P");
  expect(container.querySelector("ul")).toBe(null);
});

test("each todo is a list item with its title", () => {
  const { container } = render(<TodoList initialTodos={todos()} />);
  const items = container.querySelectorAll("ul > li");
  expect(items.length).toBe(3);
  expect(items[0].textContent).toContain("Learn React");
  expect(items[2].textContent).toContain("Ship it");
});

test("each todo has a checkbox labelled with its title, ticked when done", () => {
  render(<TodoList initialTodos={todos()} />);
  expect(screen.getByRole("checkbox", { name: "Learn React" }).checked).toBe(false);
  expect(screen.getByRole("checkbox", { name: "Build something" }).checked).toBe(true);
});

test("the count shows how many are left", () => {
  render(<TodoList initialTodos={todos()} />);
  expect(screen.getByText("2 left")).toBeTruthy();
});

test("clicking a checkbox toggles done and updates the count", () => {
  render(<TodoList initialTodos={todos()} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Learn React" }));
  expect(screen.getByRole("checkbox", { name: "Learn React" }).checked).toBe(true);
  expect(screen.getByText("1 left")).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox", { name: "Learn React" }));
  expect(screen.getByText("2 left")).toBeTruthy();
});

test("Remove deletes only that todo", () => {
  const { container } = render(<TodoList initialTodos={todos()} />);
  fireEvent.click(screen.getByRole("button", { name: "Remove Build something" }));
  expect(container.querySelectorAll("ul > li").length).toBe(2);
  expect(screen.queryByText("Build something")).toBe(null);
  expect(screen.getByRole("checkbox", { name: "Ship it" })).toBeTruthy();
});

test("removing the last todo shows the empty message", () => {
  render(<TodoList initialTodos={[{ id: 9, title: "Only one", done: false }]} />);
  fireEvent.click(screen.getByRole("button", { name: "Remove Only one" }));
  expect(screen.getByText("Nothing to do.")).toBeTruthy();
});

test("the array passed in is not changed", () => {
  const initial = todos();
  const frozen = Object.freeze(initial.map((t) => Object.freeze(t)));
  render(<TodoList initialTodos={frozen} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Learn React" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove Ship it" }));
  expect(frozen.length).toBe(3);
  expect(frozen[0].done).toBe(false);
});
