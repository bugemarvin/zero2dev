// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { total, names, adults, byId, withDefaults } from "./solution.mjs";

const users = [
  { id: 1, name: "Ada", age: 36 },
  { id: 2, name: "Tim", age: 12 },
  { id: 3, name: "Grace", age: 18 },
];

test("total adds the prices", () => {
  assert.equal(total([2, 3.5, 4]), 9.5);
  assert.equal(total([]), 0);
});

test("names returns the names in order", () => {
  assert.deepEqual(names(users), ["Ada", "Tim", "Grace"]);
  assert.deepEqual(names([]), []);
});

test("adults keeps users aged 18 or more", () => {
  assert.deepEqual(adults(users).map((u) => u.name), ["Ada", "Grace"]);
});

test("byId maps each id to its user", () => {
  const map = byId(users);
  assert.deepEqual(Object.keys(map), ["1", "2", "3"]);
  assert.equal(map[2].name, "Tim");
  assert.deepEqual(byId([]), {});
});

test("withDefaults fills in what is missing", () => {
  assert.deepEqual(withDefaults({}), { theme: "light", fontSize: 14, sidebar: true });
  assert.deepEqual(withDefaults({ theme: "dark" }), { theme: "dark", fontSize: 14, sidebar: true });
  assert.deepEqual(withDefaults({ fontSize: 18, sidebar: false, extra: 1 }),
    { theme: "light", fontSize: 18, sidebar: false, extra: 1 });
});

test("the inputs are not changed", () => {
  const prices = [1, 2];
  const options = { theme: "dark" };
  const copy = structuredClone(users);
  total(prices); names(users); adults(users); byId(users); withDefaults(options);
  assert.deepEqual(prices, [1, 2]);
  assert.deepEqual(options, { theme: "dark" });
  assert.deepEqual(users, copy);
});
