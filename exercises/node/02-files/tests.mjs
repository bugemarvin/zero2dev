// Tests. Do not edit. Run them yourself with: node --test
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readJsonOr, saveJson, countLines, findFiles } from "./solution.mjs";

async function inTempDir(run) {
  const dir = await mkdtemp(path.join(tmpdir(), "z2d-files-"));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("readJsonOr parses an existing file", () => inTempDir(async (dir) => {
  await writeFile(path.join(dir, "a.json"), '{"name": "Sam", "tags": [1, 2]}');
  assert.deepEqual(await readJsonOr(path.join(dir, "a.json"), null), { name: "Sam", tags: [1, 2] });
}));

test("readJsonOr returns the fallback when the file is missing", () => inTempDir(async (dir) => {
  assert.deepEqual(await readJsonOr(path.join(dir, "missing.json"), { items: [] }), { items: [] });
}));

test("readJsonOr throws on invalid JSON instead of hiding it", () => inTempDir(async (dir) => {
  await writeFile(path.join(dir, "bad.json"), "{not json");
  await assert.rejects(() => readJsonOr(path.join(dir, "bad.json"), {}), SyntaxError);
}));

test("saveJson writes JSON and creates missing folders", () => inTempDir(async (dir) => {
  const file = path.join(dir, "deep", "er", "data.json");
  await saveJson(file, { id: 1, list: ["a"] });
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), { id: 1, list: ["a"] });
}));

test("saveJson replaces an existing file and leaves no .tmp file", () => inTempDir(async (dir) => {
  const file = path.join(dir, "data.json");
  await saveJson(file, { version: 1 });
  await saveJson(file, { version: 2 });
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), { version: 2 });
  assert.deepEqual(await readdir(dir), ["data.json"]);
}));

test("countLines counts lines with and without a final newline", () => inTempDir(async (dir) => {
  await writeFile(path.join(dir, "a.txt"), "one\ntwo\nthree\n");
  await writeFile(path.join(dir, "b.txt"), "one\ntwo");
  await writeFile(path.join(dir, "c.txt"), "");
  await writeFile(path.join(dir, "d.txt"), "\n\n");
  assert.deepEqual([await countLines(path.join(dir, "a.txt")), await countLines(path.join(dir, "b.txt")),
    await countLines(path.join(dir, "c.txt")), await countLines(path.join(dir, "d.txt"))], [3, 2, 0, 2]);
}));

test("findFiles searches sub-folders and sorts the result", () => inTempDir(async (dir) => {
  await mkdir(path.join(dir, "docs", "api"), { recursive: true });
  await mkdir(path.join(dir, "empty"));
  await writeFile(path.join(dir, "readme.md"), "");
  await writeFile(path.join(dir, "index.js"), "");
  await writeFile(path.join(dir, "docs", "guide.md"), "");
  await writeFile(path.join(dir, "docs", "api", "users.md"), "");
  await writeFile(path.join(dir, "docs", "api", "users.json"), "");
  assert.deepEqual(await findFiles(dir, ".md"), ["docs/api/users.md", "docs/guide.md", "readme.md"]);
  assert.deepEqual(await findFiles(dir, ".json"), ["docs/api/users.json"]);
  assert.deepEqual(await findFiles(dir, ".txt"), []);
}));
