// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { EmptyStackError, Stack, counter } from "./solution.mjs";

test("EmptyStackError is an Error with a name and a message", () => {
  const error = new EmptyStackError();
  assert.ok(error instanceof Error);
  assert.equal(error.name, "EmptyStackError");
  assert.equal(error.message, "the stack is empty");
});

test("a new stack is empty", () => {
  const stack = new Stack();
  assert.equal(stack.isEmpty(), true);
  assert.equal(stack.size, 0);
});

test("pop returns items in reverse order", () => {
  const stack = new Stack();
  stack.push("a");
  stack.push("b");
  stack.push("c");
  assert.equal(stack.size, 3);
  assert.equal(stack.pop(), "c");
  assert.equal(stack.pop(), "b");
  assert.equal(stack.pop(), "a");
  assert.equal(stack.isEmpty(), true);
});

test("peek does not remove", () => {
  const stack = new Stack();
  stack.push(1);
  stack.push(2);
  assert.equal(stack.peek(), 2);
  assert.equal(stack.peek(), 2);
  assert.equal(stack.size, 2);
});

test("size is a getter, not a method", () => {
  const stack = new Stack();
  stack.push(1);
  assert.equal(typeof stack.size, "number", "read it as stack.size, defined with `get size()`");
});

test("pop and peek on an empty stack throw EmptyStackError", () => {
  const stack = new Stack();
  assert.throws(() => stack.pop(), EmptyStackError);
  assert.throws(() => stack.peek(), EmptyStackError);
});

test("the items are private and two stacks are independent", () => {
  const a = new Stack();
  const b = new Stack();
  a.push(1);
  assert.equal(a.items, undefined, "store the items in a private field such as #items");
  assert.deepEqual(Object.keys(a), [], "the stack has public fields: " + Object.keys(a));
  assert.equal(b.size, 0);
});

test("counter counts from its start value", () => {
  const c = counter();
  assert.equal(c.value(), 0);
  c.increment();
  c.increment();
  assert.equal(c.value(), 2);
  const d = counter(10);
  d.increment();
  assert.equal(d.value(), 11);
});

test("counters are independent, and reset goes back to the start", () => {
  const a = counter(5);
  const b = counter();
  a.increment();
  assert.equal(b.value(), 0);
  a.reset();
  assert.equal(a.value(), 5);
});

test("the count is not reachable from outside", () => {
  const c = counter();
  assert.deepEqual(Object.keys(c).sort(), ["increment", "reset", "value"]);
});
