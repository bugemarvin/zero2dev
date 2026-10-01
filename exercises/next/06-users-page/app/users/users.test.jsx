// Tests. Do not edit.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, fireEvent } from "@testing-library/react";
import UsersPage from "./page.jsx";
import Loading from "./loading.jsx";
import ErrorMessage from "./error.jsx";

const firstStatement = (file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "").trim().split("\n")[0].trim();
const fakeFetch = (data, ok = true) => vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => data }));

beforeEach(() => {
  process.env.API_URL = "http://api.test";
});

afterEach(() => {
  delete globalThis.fetch;
});

test("the page fetches API_URL/users", async () => {
  globalThis.fetch = fakeFetch([{ id: 1, name: "Ada" }]);
  await UsersPage();
  expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  expect(String(globalThis.fetch.mock.calls[0][0])).toBe("http://api.test/users");
});

test("the page lists the users", async () => {
  globalThis.fetch = fakeFetch([{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }]);
  const html = renderToStaticMarkup(await UsersPage());
  expect(html).toContain("<li>Ada</li>");
  expect(html).toContain("<li>Linus</li>");
  expect(html).toContain("<ul>");
});

test("an empty array shows No users yet.", async () => {
  globalThis.fetch = fakeFetch([]);
  const html = renderToStaticMarkup(await UsersPage());
  expect(html).toContain("<p>No users yet.</p>");
  expect(html).not.toContain("<ul");
});

test("a failed response makes the page throw", async () => {
  globalThis.fetch = fakeFetch({ error: "boom" }, false);
  await expect(UsersPage()).rejects.toThrow("could not load users");
});

test("loading.jsx shows a message", () => {
  expect(renderToStaticMarkup(<Loading />)).toBe("<p>Loading users...</p>");
});

test("error.jsx is a client component", () => {
  expect(firstStatement("app/users/error.jsx")).toMatch(/^["']use client["'];?$/);
});

test("error.jsx shows an alert and a button that calls reset", () => {
  const reset = vi.fn();
  render(<ErrorMessage error={new Error("x")} reset={reset} />);
  expect(screen.getByRole("alert").textContent).toContain("Something went wrong.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(reset).toHaveBeenCalledTimes(1);
});
