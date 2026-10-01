// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { createGame, update } from "./game.mjs";

const still = { left: false, right: false };
const near = (a, b) => Math.abs(a - b) < 1e-9;

function fresh(extra = {}) {
  return { ...createGame(480, 320), spawnIn: 99, ...extra };
}

test("createGame returns the starting state", () => {
  assert.deepEqual(createGame(480, 320), {
    mode: "playing", width: 480, height: 320,
    paddle: { x: 200, y: 300, w: 80, h: 10, speed: 300 },
    stars: [], score: 0, lives: 3, spawnIn: 1,
  });
});

test("the paddle moves with the keys", () => {
  assert.equal(update(fresh(), { left: false, right: true }, 0.1).paddle.x, 230);
  assert.equal(update(fresh(), { left: true, right: false }, 0.1).paddle.x, 170);
  assert.equal(update(fresh(), { left: true, right: true }, 0.1).paddle.x, 200);
  assert.equal(update(fresh(), still, 0.1).paddle.x, 200);
});

test("the paddle stays on the screen", () => {
  assert.equal(update(fresh(), { left: true, right: false }, 5).paddle.x, 0);
  assert.equal(update(fresh(), { left: false, right: true }, 5).paddle.x, 400);
});

test("stars fall by their speed", () => {
  const game = fresh({ stars: [{ x: 50, y: 10, r: 8, vy: 100 }, { x: 90, y: 40, r: 8, vy: 200 }] });
  assert.deepEqual(update(game, still, 0.5).stars, [{ x: 50, y: 60, r: 8, vy: 100 }, { x: 90, y: 140, r: 8, vy: 200 }]);
});

test("a star appears when the timer runs out, and the timer restarts", () => {
  const game = update({ ...createGame(480, 320), spawnIn: 0.05 }, still, 0.1, () => 0.5);
  assert.deepEqual(game.stars, [{ x: 240, y: 0, r: 8, vy: 120 }]);
  assert.ok(near(game.spawnIn, 0.95), `spawnIn is ${game.spawnIn}, expected 0.95`);
});

test("no star appears before the timer runs out", () => {
  const game = update({ ...createGame(480, 320), spawnIn: 0.5 }, still, 0.1, () => 0.5);
  assert.deepEqual(game.stars, []);
  assert.ok(near(game.spawnIn, 0.4));
});

test("new stars are faster when the score is higher, and land where random says", () => {
  const game = update({ ...createGame(480, 320), spawnIn: 0, score: 50 }, still, 0.016, () => 0);
  assert.deepEqual(game.stars, [{ x: 10, y: 0, r: 8, vy: 220 }]);
  assert.equal(update({ ...createGame(480, 320), spawnIn: 0 }, still, 0.016, () => 1).stars[0].x, 470);
});

test("a star that reaches the paddle is caught", () => {
  const game = update(fresh({ stars: [{ x: 240, y: 290, r: 8, vy: 100 }] }), still, 0.05);
  assert.deepEqual(game.stars, []);
  assert.equal(game.score, 10);
  assert.equal(game.lives, 3);
});

test("a star beside the paddle is not caught", () => {
  const game = update(fresh({ stars: [{ x: 100, y: 290, r: 8, vy: 100 }] }), still, 0.05);
  assert.equal(game.stars.length, 1);
  assert.equal(game.score, 0);
});

test("the catch uses the paddle's new position", () => {
  const game = update(fresh({ stars: [{ x: 300, y: 300, r: 8, vy: 0 }] }), { left: false, right: true }, 0.1);
  assert.equal(game.score, 10, "the paddle moved under the star in this frame");
});

test("a star that falls past the bottom costs a life", () => {
  const game = update(fresh({ stars: [{ x: 20, y: 315, r: 8, vy: 100 }, { x: 60, y: 100, r: 8, vy: 100 }] }), still, 0.1);
  assert.deepEqual(game.stars, [{ x: 60, y: 110, r: 8, vy: 100 }]);
  assert.equal(game.lives, 2);
  assert.equal(game.mode, "playing");
});

test("losing the last life ends the game", () => {
  const game = update(fresh({ lives: 1, score: 70, stars: [{ x: 20, y: 319, r: 8, vy: 100 }] }), still, 0.1);
  assert.equal(game.lives, 0);
  assert.equal(game.mode, "over");
  assert.equal(game.score, 70);
});

test("nothing moves when the game is over", () => {
  const over = { ...fresh({ stars: [{ x: 20, y: 20, r: 8, vy: 100 }] }), mode: "over", lives: 0 };
  assert.equal(update(over, { left: true, right: false }, 1), over);
});

test("the state passed in is never modified", () => {
  const game = fresh({ stars: [{ x: 240, y: 290, r: 8, vy: 100 }], spawnIn: 0.01 });
  const copy = JSON.parse(JSON.stringify(game));
  update(game, { left: true, right: false }, 0.05, () => 0.3);
  assert.deepEqual(game, copy);
});

test("a whole game can be played to the end", () => {
  let game = createGame(480, 320);
  let frames = 0;
  while (game.mode === "playing" && frames < 20000) {
    game = update(game, still, 0.016, () => 0.02);      // every star falls at the far left, out of reach
    frames++;
  }
  assert.equal(game.mode, "over", "three missed stars should end the game");
  assert.equal(game.lives, 0);
  assert.equal(game.score, 0);
});
