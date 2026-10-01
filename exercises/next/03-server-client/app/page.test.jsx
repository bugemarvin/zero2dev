// Tests. Do not edit.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, fireEvent } from "@testing-library/react";
import Page from "./page.jsx";
import LikeButton from "./like-button.jsx";

const firstStatement = (file) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "").trim().split("\n")[0].trim();

test("like-button.jsx starts with the \"use client\" directive", () => {
  expect(firstStatement("app/like-button.jsx")).toMatch(/^["']use client["'];?$/);
});

test("page.jsx is a server component: no \"use client\"", () => {
  expect(readFileSync("app/page.jsx", "utf8")).not.toMatch(/["']use client["']/);
});

test("LikeButton starts at 0 and shows the name", () => {
  render(<LikeButton name="Keyboard" />);
  expect(screen.getByRole("button").textContent).toBe("Like Keyboard (0)");
});

test("LikeButton counts clicks", () => {
  render(<LikeButton name="Mouse" />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Like Mouse (2)");
});

test("the page is an async function", () => {
  expect(Page.constructor.name, "declare it as: export default async function Page()").toBe("AsyncFunction");
});

test("the page lists every product with a like button", async () => {
  const html = renderToStaticMarkup(await Page());
  expect(html).toContain("<h1>Products</h1>");
  expect(html.match(/<li>/g)?.length).toBe(3);
  for (const name of ["Keyboard", "Mouse", "Monitor"]) {
    expect(html).toContain(name);
  }
  expect(html.match(/<button/g)?.length).toBe(3);
});
