# Typed functions

Complete `solution.ts`. The checker first runs the TypeScript compiler in strict mode on your file together with `usage.ts`, then runs the tests.

`usage.ts` uses your functions the way a caller would. It also contains lines marked `@ts-expect-error`: calls that **must be rejected** by the compiler. If your types are too loose, for example `any`, those lines stop being errors and the compile step fails. Do not edit `usage.ts`.

- `interface User` has `id: number`, `name: string` and an optional `email: string`.
- `displayName(user: User): string` returns the name, followed by the email in angle brackets if there is one: `Ada <ada@example.org>`.
- `parsePort(value: string | number): number` returns the port as a number. It throws an `Error` unless the result is a whole number from 1 to 65535.
- `first<T>(items: T[]): T | undefined` returns the first element, or `undefined` for an empty array.
- `type Shape` is either `{ kind: "circle"; radius: number }` or `{ kind: "rect"; width: number; height: number }`.
- `area(shape: Shape): number` returns the area. Use `Math.PI`.

This exercise uses the TypeScript compiler from the Node package set, downloaded once from Setup.
