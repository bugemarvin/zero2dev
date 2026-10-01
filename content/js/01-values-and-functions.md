---
title: Values and functions
summary: The language of the web, run from your terminal with Node. Variables, types, text and functions.
---

## Where JavaScript runs

JavaScript started in the browser, where it makes pages interactive. **Node.js** runs the same language outside the browser: on your machine and on servers. This track uses Node first, because it needs nothing but a terminal. The browser comes in [lesson 10](js/10-the-browser-and-dom), and then React.

The app checks whether Node is already installed and uses it. If it is not, the exercises can run in a Docker container instead.

```console
$ node --version
$ node
> 1 + 2
3
> .exit
```

Run a file with `node file.mjs`. The `.mjs` ending tells Node the file is a modern **module**, which lesson 3 explains.

## Variables

```javascript
const name = "Sam";      // cannot be reassigned
let count = 0;           // can be reassigned
count = count + 1;
```

Use `const` by default, and `let` only when the variable must change. Do not use the old `var`.

## Types

| Type | Examples |
| --- | --- |
| number | `42`, `3.14`, `-1` (one type for whole numbers and fractions) |
| string | `"hello"`, `'hello'`, or text between backticks |
| boolean | `true`, `false` |
| undefined | a variable with no value yet |
| null | "no value", set on purpose |
| object | `{ name: "Sam" }`, arrays, functions |

`typeof value` tells you the type as a string.

## Strings

Backticks make a **template literal**, which can contain expressions and line breaks:

```javascript
const name = "Sam";
const age = 30;
console.log(`${name} is ${age} years old`);
```

```javascript
"hello".length              // 5
"hello".toUpperCase()       // "HELLO"
"a,b,c".split(",")          // ["a", "b", "c"]
"  hi  ".trim()             // "hi"
"hello".includes("ell")     // true
"hello".slice(1, 3)         // "el"
String(42)                  // "42"
Number("42")                // 42
```

## Equality

Always use `===` and `!==`. The two-character `==` converts types before comparing, with surprising results:

```javascript
1 === 1       // true
1 === "1"     // false: different types
1 == "1"      // true: avoid this
```

## Truthy and falsy

In a condition, these count as false: `false`, `0`, `""`, `null`, `undefined` and `NaN`. Everything else counts as true, including `[]` and `{}`.

```javascript
if (name) {
  console.log("a name was given");
}
```

## Conditions and loops

```javascript
if (age >= 18) {
  console.log("adult");
} else if (age >= 13) {
  console.log("teenager");
} else {
  console.log("child");
}

for (let i = 0; i < 3; i++) {
  console.log(i);
}

const kind = age >= 18 ? "adult" : "minor";    // the conditional operator
```

## Functions

```javascript
function area(width, height) {
  return width * height;
}
```

The **arrow function** is a shorter form, used constantly:

```javascript
const area = (width, height) => {
  return width * height;
};

const double = (n) => n * 2;     // one expression: no braces, no return needed
```

Default values and "any number of arguments":

```javascript
function greet(name = "world") {
  return `Hello, ${name}!`;
}

function sum(...numbers) {       // numbers is an array of all the arguments
  let total = 0;
  for (const n of numbers) {
    total += n;
  }
  return total;
}

sum(1, 2, 3);    // 6
sum();           // 0
```

A function with no `return` gives back `undefined`.

## The exercises

Each exercise has a file for your code and a test file you can read. Functions are shared with the tests through `export`:

```javascript
export function greet(name) {
  return `Hello, ${name}!`;
}
```

Run them in the app, or in a terminal: `python3 check.py js/01-functions`

## Common mistakes

- **`==` in place of `===`.**
- **Forgetting `return`.** With braces, an arrow function returns nothing unless you say so.
- **`console.log` where a return was asked for.**
- **Adding a number to a string.** `"5" + 1` is `"51"`. Convert first with `Number("5")`.
- **Leaving out `export`.** The tests then cannot see your function.
