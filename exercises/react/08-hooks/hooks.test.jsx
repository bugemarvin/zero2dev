// Tests. Do not edit.
import { renderHook, act } from "@testing-library/react";
import { useToggle, useCounter, useLocalStorage } from "./hooks.js";

beforeEach(() => {
  localStorage.clear();
});

test("useToggle starts with the initial value", () => {
  expect(renderHook(() => useToggle()).result.current[0]).toBe(false);
  expect(renderHook(() => useToggle(true)).result.current[0]).toBe(true);
});

test("useToggle flips the value", () => {
  const { result } = renderHook(() => useToggle());
  act(() => result.current[1]());
  expect(result.current[0]).toBe(true);
  act(() => result.current[1]());
  expect(result.current[0]).toBe(false);
});

test("useCounter increments, decrements and resets", () => {
  const { result } = renderHook(() => useCounter(10, 5));
  expect(result.current.count).toBe(10);
  act(() => result.current.increment());
  expect(result.current.count).toBe(15);
  act(() => result.current.decrement());
  act(() => result.current.decrement());
  expect(result.current.count).toBe(5);
  act(() => result.current.reset());
  expect(result.current.count).toBe(10);
});

test("useCounter defaults to start 0 and step 1", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

test("two increments in a row add two steps", () => {
  const { result } = renderHook(() => useCounter(0, 2));
  act(() => {
    result.current.increment();
    result.current.increment();
  });
  expect(result.current.count).toBe(4);
});

test("each use of a hook has its own state", () => {
  const a = renderHook(() => useCounter());
  const b = renderHook(() => useCounter());
  act(() => a.result.current.increment());
  expect(a.result.current.count).toBe(1);
  expect(b.result.current.count).toBe(0);
});

test("useLocalStorage starts with the initial value and stores it", () => {
  const { result } = renderHook(() => useLocalStorage("name", "Ada"));
  expect(result.current[0]).toBe("Ada");
  expect(localStorage.getItem("name")).toBe(JSON.stringify("Ada"));
});

test("useLocalStorage saves new values as JSON", () => {
  const { result } = renderHook(() => useLocalStorage("settings", { theme: "light" }));
  act(() => result.current[1]({ theme: "dark" }));
  expect(result.current[0]).toEqual({ theme: "dark" });
  expect(JSON.parse(localStorage.getItem("settings"))).toEqual({ theme: "dark" });
});

test("useLocalStorage reads a value that was stored earlier", () => {
  localStorage.setItem("count", JSON.stringify(42));
  const { result } = renderHook(() => useLocalStorage("count", 0));
  expect(result.current[0]).toBe(42);
});
