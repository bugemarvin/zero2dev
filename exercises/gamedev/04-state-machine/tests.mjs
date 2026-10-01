// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { initialState, next } from "./game.mjs";

const playing = { mode: "playing", score: 0, lives: 3, level: 1 };

function run(state, ...events) {
  return events.reduce((current, event) => next(current, typeof event === "string" ? { type: event } : event), state);
}

test("the game starts on the menu", () => {
  assert.deepEqual(initialState(), { mode: "menu", score: 0, lives: 3, level: 1 });
});

test("start leaves the menu", () => {
  assert.deepEqual(run(initialState(), "start"), playing);
});

test("pause and resume", () => {
  assert.deepEqual(run(playing, "pause"), { ...playing, mode: "paused" });
  assert.deepEqual(run(playing, "pause", "resume"), playing);
});

test("score adds points and raises the level every 100", () => {
  assert.deepEqual(run(playing, { type: "score", points: 40 }), { mode: "playing", score: 40, lives: 3, level: 1 });
  assert.deepEqual(run(playing, { type: "score", points: 40 }, { type: "score", points: 60 }), { mode: "playing", score: 100, lives: 3, level: 2 });
  assert.deepEqual(run(playing, { type: "score", points: 250 }), { mode: "playing", score: 250, lives: 3, level: 3 });
});

test("hit takes a life, and the last one ends the game", () => {
  assert.deepEqual(run(playing, "hit"), { mode: "playing", score: 0, lives: 2, level: 1 });
  assert.deepEqual(run(playing, "hit", "hit"), { mode: "playing", score: 0, lives: 1, level: 1 });
  assert.deepEqual(run(playing, "hit", "hit", "hit"), { mode: "over", score: 0, lives: 0, level: 1 });
});

test("the score is kept when the game ends", () => {
  assert.deepEqual(run(playing, { type: "score", points: 130 }, "hit", "hit", "hit"), { mode: "over", score: 130, lives: 0, level: 2 });
});

test("restart begins a fresh game", () => {
  const over = { mode: "over", score: 130, lives: 0, level: 2 };
  assert.deepEqual(run(over, "restart"), playing);
});

test("events that do not apply return the very same object", () => {
  const cases = [
    [initialState(), ["pause", "resume", "hit", "restart", { type: "score", points: 10 }]],
    [playing, ["start", "resume", "restart"]],
    [{ ...playing, mode: "paused" }, ["start", "pause", "hit", "restart", { type: "score", points: 10 }]],
    [{ mode: "over", score: 5, lives: 0, level: 1 }, ["start", "pause", "resume", "hit", { type: "score", points: 10 }]],
  ];
  for (const [state, events] of cases) {
    for (const event of events) {
      const type = typeof event === "string" ? event : event.type;
      assert.equal(run(state, event), state, `"${type}" should do nothing in mode ${state.mode}`);
    }
  }
});

test("an unknown event does nothing", () => {
  assert.equal(run(playing, "dance"), playing);
});

test("the state passed in is never modified", () => {
  const state = Object.freeze({ ...playing });
  run(state, "hit", { type: "score", points: 500 }, "pause");
  assert.deepEqual(state, playing);
});
