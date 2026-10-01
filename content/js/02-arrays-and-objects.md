---
title: Arrays and objects
summary: The two structures all JavaScript data is built from, and the methods that transform them.
---

## Arrays

```javascript
const scores = [90, 72, 85];
scores[0]             // 90
scores.length         // 3
scores.push(60);      // add at the end
scores.includes(72)   // true
scores.indexOf(85)    // 2, or -1 when absent
```

Loop with `for...of`:

```javascript
for (const score of scores) {
  console.log(score);
}
```

## The three methods that matter

Each takes a function and returns something new. The original array is not changed.

```javascript
const numbers = [1, 2, 3, 4];

numbers.map((n) => n * 2);              // [2, 4, 6, 8]    transform each
numbers.filter((n) => n % 2 === 0);     // [2, 4]          keep some
numbers.reduce((sum, n) => sum + n, 0); // 10              combine into one value
```

`reduce` carries a running value, here `sum`, starting from the second argument, `0`.

They chain:

```javascript
const total = orders
  .filter((order) => order.paid)
  .map((order) => order.amount)
  .reduce((sum, amount) => sum + amount, 0);
```

| Method | Returns |
| --- | --- |
| `find(fn)` | the first element that matches, or `undefined` |
| `some(fn)`, `every(fn)` | whether any, or all, match |
| `slice(start, end)` | a copy of part of the array |
| `concat(other)` | a new array with both |
| `join(", ")` | a string |
| `sort((a, b) => a - b)` | sorts **in place**, by the compare function |
| `toSorted(fn)` | a sorted copy |

Without a compare function `sort` compares as text, so `[10, 9].sort()` gives `[10, 9]`. Always pass one for numbers.

## Objects

An object groups named values, called **properties**.

```javascript
const user = { name: "Sam", age: 30 };
user.name             // "Sam"
user["age"]           // 30: the same, with the name as a string
user.email            // undefined: no such property
user.email = "sam@example.com";    // add or change
delete user.age;
"name" in user        // true
```

When the variable has the same name as the property, write it once:

```javascript
const name = "Sam";
const age = 30;
const user = { name, age };       // same as { name: name, age: age }
```

Looping:

```javascript
Object.keys(user)       // ["name", "email"]
Object.values(user)     // ["Sam", "sam@example.com"]
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}
```

## Destructuring

Take values out of arrays and objects in one statement:

```javascript
const [first, second] = [10, 20];
const { name, age } = user;
const { name: userName, role = "guest" } = user;    // rename, and give a default

function describe({ name, age }) {                  // directly in the parameters
  return `${name} (${age})`;
}
```

## Spread

`...` spreads the contents of an array or object into a new one. This is how you copy and "change" data without modifying the original:

```javascript
const more = [...scores, 100];                  // a new array
const older = { ...user, age: 31 };             // a copy with one property changed
const settings = { theme: "light", size: 10, ...options };   // defaults, then overrides
```

In the last line, properties in `options` replace the defaults that come before it.

## Variables hold references

```javascript
const a = [1, 2];
const b = a;          // not a copy: the same array
b.push(3);
a                     // [1, 2, 3]
```

`const` only stops the variable being reassigned. The array or object it points to can still change. To get an independent copy, spread it: `[...a]` or `{ ...user }`.

## Optional chaining

Reading a property of `undefined` throws an error. `?.` stops and gives `undefined` instead, and `??` supplies a fallback:

```javascript
const city = user.address?.city ?? "unknown";
```

## JSON

JSON is the text format programs use to exchange data. It looks like JavaScript objects with double-quoted names.

```javascript
const text = JSON.stringify({ name: "Sam", tags: ["a", "b"] });
// '{"name":"Sam","tags":["a","b"]}'
const data = JSON.parse(text);
```

## Common mistakes

- **Changing an array or object you were given.** Callers do not expect it. Return a new one.
- **`sort()` on numbers with no compare function.**
- **Forgetting the start value of `reduce`.** On an empty array it then throws.
- **`map` when you meant `forEach`, or the reverse.** `map` builds a new array from the returned values.
- **Comparing arrays or objects with `===`.** That asks whether they are the same object, not whether they hold the same values.
