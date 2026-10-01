// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";

import { area, displayName, first, parsePort } from "./solution.ts";

test("displayName with and without an email", () => {
  assert.equal(displayName({ id: 1, name: "Ada", email: "ada@example.org" }), "Ada <ada@example.org>");
  assert.equal(displayName({ id: 2, name: "Tim" }), "Tim");
});

test("parsePort accepts numbers and numeric strings", () => {
  assert.equal(parsePort(3000), 3000);
  assert.equal(parsePort("8080"), 8080);
  assert.equal(parsePort("1"), 1);
  assert.equal(parsePort(65535), 65535);
});

test("parsePort throws for invalid ports", () => {
  for (const bad of ["abc", "", 0, -1, 65536, 80.5, "80.5"]) {
    assert.throws(() => parsePort(bad), Error, `parsePort(${JSON.stringify(bad)}) should throw`);
  }
});

test("first returns the first element or undefined", () => {
  assert.equal(first([7, 8, 9]), 7);
  assert.equal(first(["a"]), "a");
  assert.equal(first([]), undefined);
});

test("area of a circle and of a rectangle", () => {
  assert.ok(Math.abs(area({ kind: "circle", radius: 2 }) - Math.PI * 4) < 1e-9);
  assert.equal(area({ kind: "rect", width: 3, height: 4 }), 12);
});
