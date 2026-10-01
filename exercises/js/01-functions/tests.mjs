// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { greet, isAdult, fizzbuzz, sum } from "./solution.mjs";

test("greet uses the name", () => {
  assert.equal(greet("Sam"), "Hello, Sam!");
  assert.equal(greet("Ada Lovelace"), "Hello, Ada Lovelace!");
});

test("greet defaults to world", () => {
  assert.equal(greet(), "Hello, world!");
});

test("isAdult returns a boolean", () => {
  assert.equal(isAdult(18), true);
  assert.equal(isAdult(40), true);
  assert.equal(isAdult(17), false);
});

test("fizzbuzz for 1 to 15", () => {
  const got = [];
  for (let i = 1; i <= 15; i++) got.push(fizzbuzz(i));
  assert.deepEqual(got, ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]);
});

test("fizzbuzz returns strings, not numbers", () => {
  assert.equal(typeof fizzbuzz(7), "string");
});

test("sum adds any number of arguments", () => {
  assert.equal(sum(1, 2, 3), 6);
  assert.equal(sum(10), 10);
  assert.equal(sum(-5, 5), 0);
});

test("sum of nothing is 0", () => {
  assert.equal(sum(), 0);
});
