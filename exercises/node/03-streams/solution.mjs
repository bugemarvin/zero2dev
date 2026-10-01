import { EventEmitter } from "node:events";

export class Stock extends EventEmitter {
  quantity(name) {
    return 0;
  }
}

export async function* splitLines(source) {
  for await (const chunk of source) {
    yield chunk;
  }
}

export async function summarize(source) {
  return { requests: 0, errors: 0, slowest: null };
}
