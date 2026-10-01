// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { clampDt, update } from "./game.mjs";

test("clampDt keeps normal values and caps large and negative ones", () => {
  assert.deepEqual([clampDt(0.016), clampDt(0.05), clampDt(3), clampDt(-1), clampDt(0)], [0.016, 0.05, 0.05, 0, 0]);
});

test("the ball moves by velocity times time", () => {
  assert.deepEqual(update({ x: 100, y: 100, vx: 60, vy: -40, r: 10 }, 0.5, 480, 320), { x: 130, y: 80, vx: 60, vy: -40, r: 10 });
});

test("update returns a new object and leaves the old one alone", () => {
  const ball = { x: 100, y: 100, vx: 60, vy: 0, r: 10 };
  const next = update(ball, 1, 480, 320);
  assert.notEqual(next, ball);
  assert.deepEqual(ball, { x: 100, y: 100, vx: 60, vy: 0, r: 10 });
});

test("no time, no movement", () => {
  assert.deepEqual(update({ x: 50, y: 60, vx: 99, vy: 99, r: 5 }, 0, 480, 320), { x: 50, y: 60, vx: 99, vy: 99, r: 5 });
});

test("it bounces off the right wall and is put back inside", () => {
  assert.deepEqual(update({ x: 465, y: 100, vx: 100, vy: 0, r: 10 }, 0.2, 480, 320), { x: 470, y: 100, vx: -100, vy: 0, r: 10 });
});

test("it bounces off the left wall", () => {
  assert.deepEqual(update({ x: 15, y: 100, vx: -100, vy: 0, r: 10 }, 0.2, 480, 320), { x: 10, y: 100, vx: 100, vy: 0, r: 10 });
});

test("it bounces off the top and the bottom", () => {
  assert.deepEqual(update({ x: 100, y: 12, vx: 0, vy: -50, r: 10 }, 0.1, 480, 320), { x: 100, y: 10, vx: 0, vy: 50, r: 10 });
  assert.deepEqual(update({ x: 100, y: 305, vx: 0, vy: 80, r: 10 }, 0.1, 480, 320), { x: 100, y: 310, vx: 0, vy: -80, r: 10 });
});

test("a corner flips both directions", () => {
  assert.deepEqual(update({ x: 475, y: 315, vx: 50, vy: 50, r: 10 }, 0.1, 480, 320), { x: 470, y: 310, vx: -50, vy: -50, r: 10 });
});

test("a ball already outside and moving back in is not flipped again", () => {
  assert.deepEqual(update({ x: -5, y: 100, vx: 40, vy: 0, r: 10 }, 0.1, 480, 320), { x: 10, y: 100, vx: 40, vy: 0, r: 10 });
});

test("it stays inside over a thousand frames", () => {
  let ball = { x: 100, y: 100, vx: 333, vy: -271, r: 8 };
  for (let i = 0; i < 1000; i++) {
    ball = update(ball, 0.016, 480, 320);
    assert.ok(ball.x >= 8 && ball.x <= 472 && ball.y >= 8 && ball.y <= 312, `left the field at frame ${i}: ${JSON.stringify(ball)}`);
  }
});
