import { readFile, writeFile, mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";

export async function readJsonOr(file, fallback) {
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
  return JSON.parse(text);
}

export async function saveJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file + ".tmp", JSON.stringify(data, null, 2));
  await rename(file + ".tmp", file);
}

export async function countLines(file) {
  const text = await readFile(file, "utf8");
  if (text === "") {
    return 0;
  }
  const lines = text.split("\n");
  return text.endsWith("\n") ? lines.length - 1 : lines.length;
}

export async function findFiles(dir, extension) {
  const found = [];
  async function walk(folder, prefix) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(folder, entry.name), relative);
      } else if (entry.name.endsWith(extension)) {
        found.push(relative);
      }
    }
  }
  await walk(dir, "");
  return found.sort();
}
