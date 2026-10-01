// Tests. Do not edit.
import { render, screen } from "@testing-library/react";
import UserCard, { Card } from "./UserCard.jsx";

const ada = { name: "Ada", role: "Engineer", admin: true, online: true };
const tim = { name: "Tim", role: "Designer", admin: false, online: false };

test("Card renders a section with a title and its children", () => {
  const { container } = render(<Card title="Team"><p>inside</p><button>OK</button></Card>);
  const section = container.querySelector("section.card");
  expect(section, "no <section className=\"card\"> found").not.toBe(null);
  expect(section.querySelector("h2").textContent).toBe("Team");
  expect(screen.getByText("inside")).toBeTruthy();
  expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
});

test("UserCard shows the name as the card title, and the role", () => {
  const { container } = render(<UserCard user={ada} />);
  expect(container.querySelector("section.card h2").textContent).toBe("Ada");
  expect(screen.getByText("Engineer").tagName).toBe("P");
});

test("an admin gets a badge", () => {
  const { container } = render(<UserCard user={ada} />);
  expect(container.querySelector("span.badge").textContent).toBe("Admin");
});

test("a non-admin gets no badge", () => {
  const { container } = render(<UserCard user={tim} />);
  expect(container.querySelector(".badge")).toBe(null);
  expect(screen.queryByText("Admin")).toBe(null);
});

test("the status follows the online prop", () => {
  const first = render(<UserCard user={ada} />);
  expect(screen.getByText("Online")).toBeTruthy();
  first.unmount();
  render(<UserCard user={tim} />);
  expect(screen.getByText("Offline")).toBeTruthy();
  expect(screen.queryByText("Online")).toBe(null);
});

test("a user with no role shows No role", () => {
  render(<UserCard user={{ name: "Zed", admin: false, online: true }} />);
  expect(screen.getByText("No role")).toBeTruthy();
});

test("the props are not changed", () => {
  const user = Object.freeze({ ...ada });
  render(<UserCard user={user} />);
  expect(user).toEqual(ada);
});
