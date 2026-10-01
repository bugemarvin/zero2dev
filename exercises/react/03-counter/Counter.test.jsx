// Tests. Do not edit.
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter.jsx";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));

test("starts at 0 by default", () => {
  render(<Counter />);
  expect(screen.getByText("Count: 0").tagName).toBe("P");
});

test("starts at the start prop", () => {
  render(<Counter start={5} />);
  expect(screen.getByText("Count: 5")).toBeTruthy();
});

test("Add increases by one", () => {
  render(<Counter />);
  click("Add");
  click("Add");
  click("Add");
  expect(screen.getByText("Count: 3")).toBeTruthy();
});

test("Add and Subtract use the step", () => {
  render(<Counter start={10} step={4} />);
  click("Add");
  expect(screen.getByText("Count: 14")).toBeTruthy();
  click("Subtract");
  click("Subtract");
  expect(screen.getByText("Count: 6")).toBeTruthy();
});

test("the count never goes below 0", () => {
  render(<Counter start={3} step={2} />);
  click("Subtract");
  expect(screen.getByText("Count: 1")).toBeTruthy();
  click("Subtract");
  expect(screen.getByText("Count: 0")).toBeTruthy();
});

test("Subtract is disabled at 0 and enabled above it", () => {
  render(<Counter />);
  expect(screen.getByRole("button", { name: "Subtract" }).disabled).toBe(true);
  click("Add");
  expect(screen.getByRole("button", { name: "Subtract" }).disabled).toBe(false);
});

test("Reset goes back to start", () => {
  render(<Counter start={7} />);
  click("Add");
  click("Add");
  click("Reset");
  expect(screen.getByText("Count: 7")).toBeTruthy();
});

test("two counters keep separate counts", () => {
  render(<><Counter /><Counter start={100} /></>);
  fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
  expect(screen.getByText("Count: 1")).toBeTruthy();
  expect(screen.getByText("Count: 100")).toBeTruthy();
});
