// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
const cartModule = await import("./cart.mjs").catch((error) => ({ loadError: error }));
const { TAX_RATE, addItem, removeItem, total } = cartModule;
const summary = cartModule.default;

const pen = { id: 1, name: "Pen", price: 2.5 };
const book = { id: 2, name: "Book", price: 3 };

test("cart.mjs loads and has the named exports", () => {
  assert.equal(cartModule.loadError, undefined, String(cartModule.loadError));
  for (const name of ["TAX_RATE", "addItem", "removeItem", "total"]) {
    assert.notEqual(cartModule[name], undefined, `${name} is not exported`);
  }
});

test("summary is the default export", () => {
  assert.equal(typeof summary, "function", "export default function summary(cart) { ... }");
});

test("TAX_RATE is 0.2", () => {
  assert.equal(TAX_RATE, 0.2);
});

test("addItem returns a new array with the item at the end", () => {
  const cart = [pen];
  const next = addItem(cart, book);
  assert.deepEqual(next, [pen, book]);
  assert.deepEqual(cart, [pen], "the original cart was changed");
  assert.notEqual(next, cart);
});

test("removeItem returns a new array without that id", () => {
  const cart = [pen, book];
  assert.deepEqual(removeItem(cart, 1), [book]);
  assert.deepEqual(removeItem(cart, 99), [pen, book]);
  assert.deepEqual(cart, [pen, book], "the original cart was changed");
});

test("total adds tax and rounds to 2 decimals", () => {
  assert.equal(total([pen, book]), 6.6);
  assert.equal(total([{ id: 3, name: "Gum", price: 0.99 }]), 1.19);
  assert.equal(total([]), 0);
});

test("summary describes the cart", () => {
  assert.equal(summary([pen, book]), "2 items, total 6.60");
  assert.equal(summary([pen]), "1 item, total 3.00");
  assert.equal(summary([]), "0 items, total 0.00");
});
