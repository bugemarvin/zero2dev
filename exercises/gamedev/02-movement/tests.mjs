// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { direction, jump, movePlayer } from "./game.mjs";

const none = { left: false, right: false, up: false, down: false };
const near = (a, b) => Math.abs(a - b) < 1e-9;

test("direction for single keys", () => {
  assert.deepEqual(direction({ ...none, right: true }), { x: 1, y: 0 });
  assert.deepEqual(direction({ ...none, left: true }), { x: -1, y: 0 });
  assert.deepEqual(direction({ ...none, up: true }), { x: 0, y: -1 });
  assert.deepEqual(direction({ ...none, down: true }), { x: 0, y: 1 });
});

test("no keys and opposite keys give no direction", () => {
  assert.deepEqual(direction(none), { x: 0, y: 0 });
  assert.deepEqual(direction({ left: true, right: true, up: false, down: false }), { x: 0, y: 0 });
  assert.deepEqual(direction({ left: true, right: true, up: true, down: true }), { x: 0, y: 0 });
});

test("a diagonal has length 1", () => {
  const d = direction({ ...none, right: true, down: true });
  assert.ok(near(d.x, Math.SQRT1_2) && near(d.y, Math.SQRT1_2), `got ${JSON.stringify(d)}`);
  assert.ok(near(Math.hypot(d.x, d.y), 1));
  const e = direction({ ...none, left: true, up: true });
  assert.ok(near(e.x, -Math.SQRT1_2) && near(e.y, -Math.SQRT1_2), `got ${JSON.stringify(e)}`);
});

test("movePlayer moves by speed times time and returns a new object", () => {
  const player = { x: 100, y: 100, w: 20, h: 20, speed: 200 };
  const next = movePlayer(player, { ...none, right: true }, 0.25, { width: 480, height: 320 });
  assert.deepEqual(next, { x: 150, y: 100, w: 20, h: 20, speed: 200 });
  assert.deepEqual(player, { x: 100, y: 100, w: 20, h: 20, speed: 200 });
});

test("diagonal movement is not faster", () => {
  const next = movePlayer({ x: 100, y: 100, w: 20, h: 20, speed: 100 }, { ...none, right: true, down: true }, 1, { width: 480, height: 320 });
  assert.ok(near(Math.hypot(next.x - 100, next.y - 100), 100), `moved ${Math.hypot(next.x - 100, next.y - 100)} pixels, expected 100`);
});

test("the player stays inside the bounds", () => {
  const bounds = { width: 480, height: 320 };
  const big = { x: 470, y: 310, w: 20, h: 20, speed: 500 };
  assert.deepEqual(movePlayer(big, { ...none, right: true, down: true }, 1, bounds), { x: 460, y: 300, w: 20, h: 20, speed: 500 });
  assert.deepEqual(movePlayer({ ...big, x: 5, y: 5 }, { ...none, left: true, up: true }, 1, bounds), { x: 0, y: 0, w: 20, h: 20, speed: 500 });
});

test("a body resting on the ground does not change", () => {
  assert.deepEqual(jump({ y: 280, vy: 0, onGround: true }, false, 0.016, 280), { y: 280, vy: 0, onGround: true });
});

test("pressing jump on the ground starts the jump", () => {
  const next = jump({ y: 280, vy: 0, onGround: true }, true, 0.1, 280);
  assert.equal(next.onGround, false);
  assert.ok(near(next.vy, -400), `vy is ${next.vy}, expected -400`);
  assert.ok(near(next.y, 240), `y is ${next.y}, expected 240`);
});

test("pressing jump in the air does nothing extra", () => {
  const next = jump({ y: 200, vy: 100, onGround: false }, true, 0.1, 280);
  assert.ok(near(next.vy, 250) && near(next.y, 225), `got ${JSON.stringify(next)}`);
});

test("the body lands exactly on the ground", () => {
  assert.deepEqual(jump({ y: 270, vy: 300, onGround: false }, false, 0.1, 280), { y: 280, vy: 0, onGround: true });
});

test("a whole jump goes up, comes down and ends on the ground", () => {
  let body = jump({ y: 280, vy: 0, onGround: true }, true, 0.01, 280);
  let highest = body.y;
  let frames = 1;
  while (!body.onGround && frames < 500) {
    body = jump(body, false, 0.01, 280);
    highest = Math.min(highest, body.y);
    frames++;
  }
  assert.deepEqual(body, { y: 280, vy: 0, onGround: true });
  assert.ok(highest < 190 && highest > 170, `the top of the jump was at y = ${highest}`);
  assert.ok(frames > 60 && frames < 90, `the jump took ${frames} frames`);
});
