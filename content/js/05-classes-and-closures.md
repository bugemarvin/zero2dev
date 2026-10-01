---
title: Classes, closures and errors
summary: Two ways to keep state together with behaviour, and how to signal and handle failure.
---

## Closures

A function can use the variables of the place where it was created, even after that place has finished running. The function together with those remembered variables is a **closure**.

```javascript
function counter() {
  let count = 0;
  return {
    increment() {
      count += 1;
    },
    value() {
      return count;
    },
  };
}

const a = counter();
a.increment();
a.increment();
a.value();          // 2

const b = counter();
b.value();          // 0: its own count
```

Nothing outside can reach `count` except through the two functions. That is real privacy, with no class involved. Each call to `counter` creates a fresh `count`.

Closures are everywhere in JavaScript: event handlers, callbacks, and React hooks all rely on them.

## Classes

A class describes objects that share the same methods.

```javascript
class Stack {
  #items = [];                  // a private field: only code inside the class can use it

  push(item) {
    this.#items.push(item);
  }

  pop() {
    if (this.#items.length === 0) {
      throw new EmptyStackError();
    }
    return this.#items.pop();
  }

  get size() {                  // a getter: read as stack.size, with no brackets
    return this.#items.length;
  }
}

const stack = new Stack();
stack.push(1);
stack.size;         // 1
```

- `new Stack()` creates an object. A method named `constructor`, if present, runs at that moment.
- `this` is the object the method was called on.
- A name starting with `#` is private.
- `get` defines a property that is computed when read.

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  static origin() {             // called on the class: Point.origin()
    return new Point(0, 0);
  }
}
```

## Inheritance

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks`;
  }
}
```

A subclass that defines its own `constructor` must call `super(...)` before using `this`.

## The trouble with this

`this` is decided by **how a function is called**, not where it was written. Take a method off its object and `this` is lost:

```javascript
const pop = stack.pop;
pop();                          // error: this is undefined

button.addEventListener("click", stack.pop);              // same problem
button.addEventListener("click", () => stack.pop());      // correct
```

Arrow functions have no `this` of their own. They use the one from where they were written, which is why they are the usual choice for callbacks.

## Errors

```javascript
function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age)) {
    throw new Error(`not a number: ${text}`);
  }
  return age;
}

try {
  parseAge("abc");
} catch (error) {
  console.error(error.message);
} finally {
  console.log("done");
}
```

Always throw an `Error` object, never a bare string. It carries a `message` and a stack trace.

## Your own error types

A named error class lets callers tell one failure from another:

```javascript
class EmptyStackError extends Error {
  constructor() {
    super("the stack is empty");
    this.name = "EmptyStackError";
  }
}

try {
  stack.pop();
} catch (error) {
  if (error instanceof EmptyStackError) {
    console.log("nothing to pop");
  } else {
    throw error;                // not ours to handle: pass it on
  }
}
```

## Class or closure?

| | Closure | Class |
| --- | --- | --- |
| Privacy | automatic | with `#` fields |
| Many objects of the same shape | each gets its own copies of the functions | methods are shared |
| `instanceof` checks, inheritance | no | yes |
| Problems with `this` | none | possible |

For a small bundle of state and a few functions, a closure is the simplest thing. For a type with many instances, or one that others extend, use a class.

## Common mistakes

- **Forgetting `new`.** Calling a class as a function is an error.
- **Passing a method as a callback** and losing `this`.
- **Throwing strings.**
- **A `catch` that swallows every error**, including the ones that reveal bugs.
- **Forgetting `super()`** in a subclass constructor.
