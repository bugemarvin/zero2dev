// Tests. Do not edit.
import { render, screen } from "@testing-library/react";
import UserList from "./UserList.jsx";

function fakeFetch(data, { ok = true, delay = 5 } = {}) {
  return vi.fn((url) => new Promise((resolve) => {
    setTimeout(() => resolve({ ok, status: ok ? 200 : 500, json: async () => (typeof data === "function" ? data(url) : data) }), delay);
  }));
}

afterEach(() => {
  delete globalThis.fetch;
});

test("shows Loading... while the request is running", () => {
  globalThis.fetch = fakeFetch([{ id: 1, name: "Ada" }]);
  render(<UserList url="/api/users" />);
  expect(screen.getByText("Loading...").tagName).toBe("P");
});

test("fetches the given url once", async () => {
  globalThis.fetch = fakeFetch([{ id: 1, name: "Ada" }]);
  render(<UserList url="/api/users" />);
  await screen.findByText("Ada");
  expect(globalThis.fetch.mock.calls.map((call) => String(call[0]))).toEqual(["/api/users"]);
});

test("shows the users in a list", async () => {
  globalThis.fetch = fakeFetch([{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }]);
  const { container } = render(<UserList url="/api/users" />);
  await screen.findByText("Linus");
  expect([...container.querySelectorAll("ul > li")].map((li) => li.textContent)).toEqual(["Ada", "Linus"]);
  expect(screen.queryByText("Loading...")).toBe(null);
});

test("an empty array shows No users yet.", async () => {
  globalThis.fetch = fakeFetch([]);
  const { container } = render(<UserList url="/api/users" />);
  expect((await screen.findByText("No users yet.")).tagName).toBe("P");
  expect(container.querySelector("ul")).toBe(null);
});

test("a failed status shows an alert", async () => {
  globalThis.fetch = fakeFetch({ error: "boom" }, { ok: false });
  render(<UserList url="/api/users" />);
  expect((await screen.findByRole("alert")).textContent).toBe("Could not load users.");
  expect(screen.queryByText("Loading...")).toBe(null);
});

test("a network error shows an alert", async () => {
  globalThis.fetch = vi.fn(() => Promise.reject(new Error("offline")));
  render(<UserList url="/api/users" />);
  expect((await screen.findByRole("alert")).textContent).toBe("Could not load users.");
});

test("a new url loads again", async () => {
  globalThis.fetch = fakeFetch((url) => (url === "/a" ? [{ id: 1, name: "From A" }] : [{ id: 2, name: "From B" }]));
  const { rerender } = render(<UserList url="/a" />);
  await screen.findByText("From A");
  rerender(<UserList url="/b" />);
  expect(screen.getByText("Loading...")).toBeTruthy();
  await screen.findByText("From B");
  expect(screen.queryByText("From A")).toBe(null);
});

test("a slow answer to an old url does not overwrite the new one", async () => {
  globalThis.fetch = vi.fn((url) => new Promise((resolve) => {
    const slow = url === "/slow";
    setTimeout(() => resolve({ ok: true, status: 200, json: async () => [{ id: 1, name: slow ? "Old" : "New" }] }), slow ? 120 : 10);
  }));
  const { rerender } = render(<UserList url="/slow" />);
  rerender(<UserList url="/fast" />);
  await screen.findByText("New");
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(screen.queryByText("Old"), "the late response for the old url replaced the new data").toBe(null);
  expect(screen.getByText("New")).toBeTruthy();
});
