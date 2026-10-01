// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { parseArgs, loadConfig } from "./solution.mjs";

test("parseArgs reads a command, options and the rest", () => {
  assert.deepEqual(parseArgs(["serve", "site", "--port", "8080", "--verbose"]),
    { command: "serve", options: { port: "8080", verbose: true }, rest: ["site"] });
});

test("parseArgs with no arguments", () => {
  assert.deepEqual(parseArgs([]), { command: null, options: {}, rest: [] });
});

test("an option at the end is a flag", () => {
  assert.deepEqual(parseArgs(["build", "--watch"]), { command: "build", options: { watch: true }, rest: [] });
});

test("an option followed by another option is a flag", () => {
  assert.deepEqual(parseArgs(["--quiet", "--out", "dist", "build", "a", "b"]),
    { command: "build", options: { quiet: true, out: "dist" }, rest: ["a", "b"] });
});

test("--name=value works, including an empty value and an equals sign in the value", () => {
  assert.deepEqual(parseArgs(["run", "--env=prod", "--tag=", "--query=a=b"]),
    { command: "run", options: { env: "prod", tag: "", query: "a=b" }, rest: [] });
});

test("loadConfig returns typed values", () => {
  assert.deepEqual(loadConfig({ PORT: "8080", DATABASE_URL: "postgres://db", DEBUG: "true" }),
    { port: 8080, databaseUrl: "postgres://db", debug: true });
});

test("the port defaults to 3000 and debug to false", () => {
  assert.deepEqual(loadConfig({ DATABASE_URL: "postgres://db" }), { port: 3000, databaseUrl: "postgres://db", debug: false });
});

test("debug is true only for 1 and true", () => {
  const debug = (value) => loadConfig({ DATABASE_URL: "x", DEBUG: value }).debug;
  assert.deepEqual([debug("1"), debug("true"), debug("false"), debug("0"), debug("yes"), debug("")],
    [true, true, false, false, false, false]);
});

test("a bad port is refused", () => {
  for (const port of ["abc", "0", "70000", "80.5", "-1"]) {
    assert.throws(() => loadConfig({ PORT: port, DATABASE_URL: "x" }),
      { message: "PORT must be a number from 1 to 65535" }, `PORT=${port} should be refused`);
  }
});

test("a missing database address is refused", () => {
  assert.throws(() => loadConfig({ PORT: "80" }), { message: "DATABASE_URL is required" });
  assert.throws(() => loadConfig({ DATABASE_URL: "" }), { message: "DATABASE_URL is required" });
});
