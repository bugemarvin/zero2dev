export class EmptyStackError extends Error {
  constructor() {
    super("the stack is empty");
    this.name = "EmptyStackError";
  }
}

export class Stack {
  #items = [];

  push(item) {
    this.#items.push(item);
  }

  pop() {
    if (this.#items.length === 0) {
      throw new EmptyStackError();
    }
    return this.#items.pop();
  }

  peek() {
    if (this.#items.length === 0) {
      throw new EmptyStackError();
    }
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }
}

export function counter(start = 0) {
  let count = start;
  return {
    increment() {
      count += 1;
    },
    reset() {
      count = start;
    },
    value() {
      return count;
    },
  };
}
