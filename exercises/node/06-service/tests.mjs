// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { createLibrary } from "./solution.mjs";

const DAY = 24 * 60 * 60 * 1000;

function setup() {
  const store = new Map([
    [1, { id: 1, title: "Dune", borrowedBy: null, dueAt: null }],
    [2, { id: 2, title: "Emma", borrowedBy: "kim", dueAt: 10 * DAY }],
  ]);
  const world = { now: 0, saves: 0, messages: [] };
  const library = createLibrary({
    books: {
      findById: async (id) => (store.has(id) ? { ...store.get(id) } : null),
      save: async (book) => { world.saves++; store.set(book.id, { ...book }); },
    },
    clock: () => world.now,
    notify: async (memberId, message) => { world.messages.push([memberId, message]); },
  });
  return { library, store, world };
}

test("borrow marks the book and sets the due date 14 days ahead", async () => {
  const { library, store, world } = setup();
  world.now = 3 * DAY;
  const book = await library.borrow(1, "ada");
  assert.deepEqual(book, { id: 1, title: "Dune", borrowedBy: "ada", dueAt: 17 * DAY });
  assert.deepEqual(store.get(1), { id: 1, title: "Dune", borrowedBy: "ada", dueAt: 17 * DAY }, "the book must be saved");
});

test("borrow refuses an unknown book and a borrowed one", async () => {
  const { library, world } = setup();
  await assert.rejects(() => library.borrow(99, "ada"), { message: "book not found" });
  await assert.rejects(() => library.borrow(2, "ada"), { message: "book is already borrowed" });
  assert.equal(world.saves, 0, "nothing should be saved when borrowing fails");
});

test("giveBack on time frees the book with no fee", async () => {
  const { library, store, world } = setup();
  world.now = 10 * DAY;
  assert.deepEqual(await library.giveBack(2, "kim"), { late: false, fee: 0 });
  assert.deepEqual(store.get(2), { id: 2, title: "Emma", borrowedBy: null, dueAt: null });
  assert.deepEqual(world.messages, []);
});

test("giveBack late charges 50 per started day and notifies the member", async () => {
  const { library, world } = setup();
  world.now = 10 * DAY + 1;
  assert.deepEqual(await library.giveBack(2, "kim"), { late: true, fee: 50 });
  assert.deepEqual(world.messages, [["kim", "late fee: 50"]]);
});

test("three and a half days late costs four days", async () => {
  const { library, world } = setup();
  world.now = 13.5 * DAY;
  assert.deepEqual(await library.giveBack(2, "kim"), { late: true, fee: 200 });
  assert.deepEqual(world.messages, [["kim", "late fee: 200"]]);
});

test("giveBack refuses an unknown book, a free book and another member's book", async () => {
  const { library, world } = setup();
  await assert.rejects(() => library.giveBack(99, "kim"), { message: "book not found" });
  await assert.rejects(() => library.giveBack(1, "kim"), { message: "not borrowed by this member" });
  await assert.rejects(() => library.giveBack(2, "ada"), { message: "not borrowed by this member" });
  assert.equal(world.saves, 0);
});

test("isAvailable", async () => {
  const { library } = setup();
  assert.deepEqual([await library.isAvailable(1), await library.isAvailable(2), await library.isAvailable(99)],
    [true, false, false]);
});

test("a full round: borrow, then give back", async () => {
  const { library, world } = setup();
  await library.borrow(1, "ada");
  assert.equal(await library.isAvailable(1), false);
  world.now = 5 * DAY;
  assert.deepEqual(await library.giveBack(1, "ada"), { late: false, fee: 0 });
  assert.equal(await library.isAvailable(1), true);
});
