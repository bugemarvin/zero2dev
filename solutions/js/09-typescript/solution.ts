export interface User {
  id: number;
  name: string;
  email?: string;
}

export type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

export function displayName(user: User): string {
  return user.email ? `${user.name} <${user.email}>` : user.name;
}

export function parsePort(value: string | number): number {
  const port = typeof value === "number" ? value : Number(value.trim() === "" ? NaN : value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`invalid port: ${value}`);
  }
  return port;
}

export function first<T>(items: T[]): T | undefined {
  return items[0];
}

export function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rect":
      return shape.width * shape.height;
  }
}
