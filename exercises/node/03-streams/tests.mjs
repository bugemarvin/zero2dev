// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { Stock, splitLines, summarize } from "./solution.mjs";

async function collect(iterable) {
  const items = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

test("Stock is an EventEmitter and starts empty", () => {
  const stock = new Stock();
  assert.ok(stock instanceof EventEmitter);
  assert.equal(stock.quantity("mug"), 0);
});

test("add changes the quantity and emits changed with the new total", () => {
  const stock = new Stock();
  const events = [];
  stock.on("changed", (event) => events.push(event));
  stock.add("mug", 3);
  stock.add("mug", 2);
  stock.add("pen", 1);
  assert.equal(stock.quantity("mug"), 5);
  assert.deepEqual(events, [{ name: "mug", quantity: 3 }, { name: "mug", quantity: 5 }, { name: "pen", quantity: 1 }]);
});

test("remove emits changed, and empty after it when the total reaches 0", () => {
  const stock = new Stock();
  stock.add("mug", 3);
  const events = [];
  stock.on("changed", (event) => events.push(["changed", event.quantity]));
  stock.on("empty", (name) => events.push(["empty", name]));
  stock.remove("mug", 1);
  stock.remove("mug", 2);
  assert.deepEqual(events, [["changed", 2], ["changed", 0], ["empty", "mug"]]);
});

test("removing too much changes nothing and emits error", () => {
  const stock = new Stock();
  stock.add("mug", 1);
  const errors = [];
  let changed = 0;
  stock.on("error", (error) => errors.push(error));
  stock.on("changed", () => changed++);
  stock.remove("mug", 5);
  assert.equal(stock.quantity("mug"), 1);
  assert.equal(changed, 0);
  assert.equal(errors.length, 1);
  assert.ok(errors[0] instanceof Error);
  assert.equal(errors[0].message, "not enough mug");
});

test("splitLines joins chunks that end in the middle of a line", async () => {
  assert.deepEqual(await collect(splitLines(Readable.from(["one\ntw", "o\nthr", "ee\n"]))), ["one", "two", "three"]);
});

test("splitLines yields a last line without a newline, and empty lines in the middle", async () => {
  assert.deepEqual(await collect(splitLines(Readable.from(["a\n\nb\nlast"]))), ["a", "", "b", "last"]);
  assert.deepEqual(await collect(splitLines(Readable.from([]))), []);
  assert.deepEqual(await collect(splitLines(Readable.from(["x", "y", "z"]))), ["xyz"]);
});

test("summarize counts requests and errors and finds the slowest path", async () => {
  const log = ["GET /home 200 12\nGET /rep", "ort 500 950\n\nPOST /login 401 30\nGET /api 503 4"];
  assert.deepEqual(await summarize(Readable.from(log)), { requests: 4, errors: 2, slowest: "/report" });
});

test("summarize of an empty log", async () => {
  assert.deepEqual(await summarize(Readable.from(["\n\n"])), { requests: 0, errors: 0, slowest: null });
});
