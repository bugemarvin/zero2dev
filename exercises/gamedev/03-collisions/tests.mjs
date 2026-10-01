// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { circleRect, circlesOverlap, collect, rectsOverlap } from "./game.mjs";

const box = { x: 100, y: 100, w: 50, h: 40 };

test("rectangles that overlap", () => {
  assert.equal(rectsOverlap(box, { x: 120, y: 110, w: 100, h: 100 }), true);
  assert.equal(rectsOverlap(box, { x: 60, y: 80, w: 50, h: 30 }), true);
  assert.equal(rectsOverlap(box, { x: 110, y: 110, w: 5, h: 5 }), true, "one inside the other");
  assert.equal(rectsOverlap({ x: 110, y: 110, w: 5, h: 5 }, box), true, "the other way round");
});

test("rectangles apart on each side", () => {
  assert.equal(rectsOverlap(box, { x: 200, y: 100, w: 20, h: 20 }), false, "to the right");
  assert.equal(rectsOverlap(box, { x: 10, y: 100, w: 20, h: 20 }), false, "to the left");
  assert.equal(rectsOverlap(box, { x: 100, y: 10, w: 20, h: 20 }), false, "above");
  assert.equal(rectsOverlap(box, { x: 100, y: 200, w: 20, h: 20 }), false, "below");
});

test("rectangles that overlap on one axis only do not overlap", () => {
  assert.equal(rectsOverlap(box, { x: 110, y: 300, w: 20, h: 20 }), false);
  assert.equal(rectsOverlap(box, { x: 300, y: 110, w: 20, h: 20 }), false);
});

test("rectangles that only touch do not overlap", () => {
  assert.equal(rectsOverlap(box, { x: 150, y: 100, w: 20, h: 20 }), false, "sharing the right edge");
  assert.equal(rectsOverlap(box, { x: 100, y: 140, w: 20, h: 20 }), false, "sharing the bottom edge");
  assert.equal(rectsOverlap(box, { x: 150, y: 140, w: 20, h: 20 }), false, "sharing a corner");
});

test("circles", () => {
  assert.equal(circlesOverlap({ x: 0, y: 0, r: 10 }, { x: 15, y: 0, r: 10 }), true);
  assert.equal(circlesOverlap({ x: 0, y: 0, r: 10 }, { x: 12, y: 12, r: 10 }), true, "diagonal distance about 17");
  assert.equal(circlesOverlap({ x: 0, y: 0, r: 10 }, { x: 15, y: 15, r: 10 }), false, "diagonal distance about 21");
  assert.equal(circlesOverlap({ x: 0, y: 0, r: 10 }, { x: 20, y: 0, r: 10 }), false, "exactly touching");
  assert.equal(circlesOverlap({ x: 5, y: 5, r: 1 }, { x: 5, y: 5, r: 30 }), true, "one inside the other");
});

test("a circle and a rectangle", () => {
  assert.equal(circleRect({ x: 125, y: 120, r: 5 }, box), true, "centre inside");
  assert.equal(circleRect({ x: 92, y: 120, r: 10 }, box), true, "reaching in from the left");
  assert.equal(circleRect({ x: 85, y: 120, r: 10 }, box), false, "too far left");
  assert.equal(circleRect({ x: 125, y: 148, r: 10 }, box), true, "reaching in from below");
  assert.equal(circleRect({ x: 125, y: 155, r: 10 }, box), false, "too far below");
});

test("a circle near a corner uses the distance to the corner", () => {
  assert.equal(circleRect({ x: 93, y: 93, r: 10 }, box), true, "corner distance about 9.9");
  assert.equal(circleRect({ x: 92, y: 92, r: 10 }, box), false, "corner distance about 11.3: a box test would say true");
});

test("collect removes the touched coins and counts them", () => {
  const coins = [{ x: 125, y: 120, r: 6 }, { x: 300, y: 300, r: 6 }, { x: 96, y: 120, r: 6 }, { x: 10, y: 10, r: 6 }];
  const result = collect(box, coins);
  assert.deepEqual(result, { coins: [{ x: 300, y: 300, r: 6 }, { x: 10, y: 10, r: 6 }], collected: 2 });
  assert.equal(coins.length, 4, "the original array must not change");
});

test("collect with nothing to pick up, and with no coins", () => {
  assert.deepEqual(collect(box, [{ x: 0, y: 0, r: 3 }]), { coins: [{ x: 0, y: 0, r: 3 }], collected: 0 });
  assert.deepEqual(collect(box, []), { coins: [], collected: 0 });
});
