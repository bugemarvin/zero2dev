export interface User {
  id: number;
  name: string;
}

export type Shape = { kind: "circle"; radius: number };

export function displayName(user: User): string {
  return "";
}

export function parsePort(value: string | number): number {
  return 0;
}

export function first<T>(items: T[]): T | undefined {
  return undefined;
}

export function area(shape: Shape): number {
  return 0;
}
