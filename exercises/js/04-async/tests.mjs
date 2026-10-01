// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { delay, fetchAll, retry, withTimeout } from "./solution.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("delay returns a promise", () => {
  const result = delay(1, "x");
  assert.ok(result instanceof Promise, "delay must return a promise");
});

test("delay is fulfilled with the value after the time has passed", async () => {
  const started = Date.now();
  assert.equal(await delay(80, "done"), "done");
  assert.ok(Date.now() - started >= 70, "it resolved too early");
});

test("fetchAll returns the results in the order of the ids", async () => {
  const slowFirst = async (id) => { await sleep(id === 1 ? 60 : 5); return `user-${id}`; };
  assert.deepEqual(await fetchAll([1, 2, 3], slowFirst), ["user-1", "user-2", "user-3"]);
  assert.deepEqual(await fetchAll([], slowFirst), []);
});

test("fetchAll runs the calls at the same time", async () => {
  const started = Date.now();
  await fetchAll([1, 2, 3, 4, 5], async (id) => { await sleep(100); return id; });
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 350, `took ${elapsed} ms: the calls ran one after another`);
});

test("retry returns the first success", async () => {
  let calls = 0;
  const flaky = async () => { calls++; if (calls < 3) throw new Error("fail " + calls); return "ok"; };
  assert.equal(await retry(flaky, 5), "ok");
  assert.equal(calls, 3);
});

test("retry does not call again after a success", async () => {
  let calls = 0;
  await retry(async () => { calls++; return 1; }, 4);
  assert.equal(calls, 1);
});

test("retry rejects with the last error when every attempt fails", async () => {
  let calls = 0;
  const failing = async () => { calls++; throw new Error("fail " + calls); };
  await assert.rejects(retry(failing, 3), { message: "fail 3" });
  assert.equal(calls, 3);
});

test("withTimeout passes a fast result through", async () => {
  assert.equal(await withTimeout(sleep(10).then(() => "fast"), 200), "fast");
});

test("withTimeout rejects with 'timeout' when the promise is too slow", async () => {
  await assert.rejects(withTimeout(sleep(300), 40), { message: "timeout" });
});

test("withTimeout passes a rejection through", async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error("boom")), 200), { message: "boom" });
});
