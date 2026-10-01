// Tests. Do not edit.
import { render, screen, fireEvent, act } from "@testing-library/react";
import Stopwatch, { DocumentTitle } from "./Timer.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const tick = (ms) => act(() => { vi.advanceTimersByTime(ms); });

test("DocumentTitle sets the page title", () => {
  render(<DocumentTitle title="Inbox" />);
  expect(document.title).toBe("Inbox");
});

test("DocumentTitle follows the prop when it changes", () => {
  const { rerender } = render(<DocumentTitle title="Inbox" />);
  rerender(<DocumentTitle title="Sent (3)" />);
  expect(document.title).toBe("Sent (3)");
});

test("DocumentTitle renders nothing", () => {
  const { container } = render(<DocumentTitle title="x" />);
  expect(container.innerHTML).toBe("");
});

test("the stopwatch starts at 0 seconds and is not running", () => {
  render(<Stopwatch />);
  expect(screen.getByText("0 seconds").tagName).toBe("P");
  expect(screen.getByRole("button").textContent).toBe("Start");
  tick(3000);
  expect(screen.getByText("0 seconds")).toBeTruthy();
});

test("Start begins counting, one per second", () => {
  render(<Stopwatch />);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("button").textContent).toBe("Stop");
  tick(1000);
  expect(screen.getByText("1 second")).toBeTruthy();
  tick(2000);
  expect(screen.getByText("3 seconds")).toBeTruthy();
});

test("Stop pauses and keeps the number", () => {
  render(<Stopwatch />);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  tick(2000);
  fireEvent.click(screen.getByRole("button", { name: "Stop" }));
  expect(screen.getByRole("button").textContent).toBe("Start");
  tick(5000);
  expect(screen.getByText("2 seconds")).toBeTruthy();
});

test("Start again continues from where it stopped", () => {
  render(<Stopwatch />);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  tick(2000);
  fireEvent.click(screen.getByRole("button", { name: "Stop" }));
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  tick(3000);
  expect(screen.getByText("5 seconds")).toBeTruthy();
});

test("only one timer runs at a time", () => {
  render(<Stopwatch />);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  tick(1000);
  expect(vi.getTimerCount()).toBe(1);
});

test("the timer is cleared when the component is removed", () => {
  const { unmount } = render(<Stopwatch />);
  fireEvent.click(screen.getByRole("button", { name: "Start" }));
  tick(1000);
  unmount();
  expect(vi.getTimerCount(), "the interval is still running after unmount: return a cleanup function from the effect").toBe(0);
});
