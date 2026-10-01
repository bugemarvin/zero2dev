---
title: TypeScript basics
summary: JavaScript with types. Mistakes that used to appear when the program ran are caught while you type.
---

## What TypeScript is

TypeScript is JavaScript plus **type annotations**. A tool called the compiler, `tsc`, reads the annotations and reports mismatches. The annotations are then removed, and what runs is plain JavaScript.

```typescript
function area(width: number, height: number): number {
  return width * height;
}

area(3, "4");
// error: Argument of type 'string' is not assignable to parameter of type 'number'.
```

The error appears in your editor as you type, and when `tsc` runs. Nothing has to execute.

Files end in `.ts`. Recent versions of Node can run a `.ts` file directly by stripping the types, with no checking. Checking is the job of `tsc`:

```console
$ npx tsc --noEmit --strict app.ts
```

## Basic types

```typescript
const name: string = "Sam";
let count: number = 0;
const done: boolean = false;
const tags: string[] = ["a", "b"];
const point: [number, number] = [3, 4];
```

TypeScript **infers** types from values, so most annotations on variables are unnecessary. `const name = "Sam"` is already known to be a string. Annotate function parameters and return values. That is where the contract between pieces of code lives.

## Object types

```typescript
interface User {
  id: number;
  name: string;
  email?: string;          // optional: may be missing
}

function displayName(user: User): string {
  return user.email ? `${user.name} <${user.email}>` : user.name;
}
```

An `interface` describes the shape of an object. A value fits if it has the required properties with the right types.

`type` gives a name to any type, and is what you use for the combinations below:

```typescript
type Id = number | string;
```

## Union types and narrowing

A **union** says a value is one of several types:

```typescript
function parsePort(value: string | number): number {
  if (typeof value === "number") {
    return value;                    // TypeScript knows: number
  }
  return Number(value);              // and here: string
}
```

Inside the `if`, TypeScript has **narrowed** the type. It follows `typeof`, `===`, `in`, `instanceof` and truthiness checks.

This is what makes `undefined` safe. An optional property has type `string | undefined`, and you cannot call a string method on it until you have ruled `undefined` out:

```typescript
function emailDomain(user: User): string | undefined {
  if (!user.email) {
    return undefined;
  }
  return user.email.split("@")[1];
}
```

## Literal types and discriminated unions

A type can be one specific value. Combined with a union, that describes "exactly one of these shapes":

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}
```

In each `case` TypeScript knows which shape it has, and which properties exist. Add a third kind to `Shape`, and the compiler points at every `switch` that does not handle it yet.

## Generics

A **generic** function works for any type while keeping track of which one:

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);        // number | undefined
const s = first(["a", "b"]);       // string | undefined
```

`T` is filled in from the argument. You have already used generics: `string[]` is short for `Array<string>`, and `Promise<User>` is a promise of a user.

## any and unknown

`any` switches type checking off for a value. It spreads: everything computed from an `any` is `any` too. Avoid it.

`unknown` is the safe alternative for values you know nothing about, such as parsed JSON. You must narrow it before use:

```typescript
function lengthOf(value: unknown): number {
  if (typeof value === "string") {
    return value.length;
  }
  return 0;
}
```

## Strict mode

Always use `--strict`, or `"strict": true` in `tsconfig.json`. Without it, `null` and `undefined` are allowed everywhere and much of the benefit is lost.

A project's settings live in `tsconfig.json`, created with `npx tsc --init`.

## What types do not do

Types disappear before the program runs. They cannot check data that arrives from outside: a request body, a file, an API response. Declaring that `req.body` is a `User` does not make it one. Validate such data with real code.

## Common mistakes

- **`any` to make an error go away.**
- **Annotating everything.** Let inference work.
- **Trusting a type for outside data.**
- **Ignoring the `undefined` half** of an optional value with `!`.
- **Expecting Node to report type errors** when it runs a `.ts` file. Only `tsc` checks.
