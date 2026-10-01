import { readFile, writeFile, mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";

export async function readJsonOr(file, fallback) {
  return fallback;
}

export async function saveJson(file, data) {
}

export async function countLines(file) {
  return 0;
}

export async function findFiles(dir, extension) {
  return [];
}
