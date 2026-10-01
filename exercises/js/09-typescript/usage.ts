// Used by the compile step. Do not edit.
import { area, displayName, first, parsePort } from "./solution.ts";
import type { Shape, User } from "./solution.ts";

const withEmail: User = { id: 1, name: "Ada", email: "ada@example.org" };
const withoutEmail: User = { id: 2, name: "Tim" };
const text: string = displayName(withEmail) + displayName(withoutEmail);

const port: number = parsePort("8080") + parsePort(3000);

const n: number | undefined = first([1, 2, 3]);
const s: string | undefined = first(["a", "b"]);

const circle: Shape = { kind: "circle", radius: 1 };
const rect: Shape = { kind: "rect", width: 2, height: 3 };
const total: number = area(circle) + area(rect);

// @ts-expect-error a user needs a name
const noName: User = { id: 3 };
// @ts-expect-error the id is a number
const badId: User = { id: "3", name: "x" };
// @ts-expect-error parsePort takes a string or a number
parsePort(true);
// @ts-expect-error first returns the element type, so this is not a string
const wrong: string = first([1, 2, 3]);
// @ts-expect-error a triangle is not a Shape
area({ kind: "triangle", base: 1, height: 2 });
// @ts-expect-error a circle has no width
area({ kind: "circle", width: 2 });

export { text, port, n, s, total, noName, badId, wrong };
