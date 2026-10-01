import { EventEmitter } from "node:events";

export class Stock extends EventEmitter {
  #items = new Map();

  quantity(name) {
    return this.#items.get(name) ?? 0;
  }

  add(name, quantity) {
    const total = this.quantity(name) + quantity;
    this.#items.set(name, total);
    this.emit("changed", { name, quantity: total });
  }

  remove(name, quantity) {
    const total = this.quantity(name) - quantity;
    if (total < 0) {
      this.emit("error", new Error(`not enough ${name}`));
      return;
    }
    this.#items.set(name, total);
    this.emit("changed", { name, quantity: total });
    if (total === 0) {
      this.emit("empty", name);
    }
  }
}

export async function* splitLines(source) {
  let rest = "";
  for await (const chunk of source) {
    const parts = (rest + chunk).split("\n");
    rest = parts.pop();
    yield* parts;
  }
  if (rest !== "") {
    yield rest;
  }
}

export async function summarize(source) {
  const summary = { requests: 0, errors: 0, slowest: null };
  let longest = -1;
  for await (const line of splitLines(source)) {
    if (line.trim() === "") {
      continue;
    }
    const [, path, status, ms] = line.trim().split(/\s+/);
    summary.requests++;
    if (Number(status) >= 500) {
      summary.errors++;
    }
    if (Number(ms) > longest) {
      longest = Number(ms);
      summary.slowest = path;
    }
  }
  return summary;
}
