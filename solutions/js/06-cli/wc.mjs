import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node wc.mjs FILE");
  process.exit(2);
}

let text;
try {
  text = readFileSync(file, "utf8");
} catch (error) {
  console.error(`error: cannot read ${file}`);
  process.exit(1);
}

const lines = text.split("\n").length - 1;
const words = text.split(/\s+/).filter(Boolean).length;
console.log(`${lines} ${words} ${text.length}`);
