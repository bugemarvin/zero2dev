# A small file store

Write four `async` functions in `solution.mjs`. Use `node:fs/promises` and `node:path`.

- `readJsonOr(file, fallback)` returns the parsed JSON of the file. When the file does **not exist**, it returns `fallback`. Any other problem, such as invalid JSON, is thrown on.
- `saveJson(file, data)` writes the data as JSON. It creates the parent folders when they are missing. It writes to `file + ".tmp"` first and then renames it to `file`, so no `.tmp` file is left behind.
- `countLines(file)` returns the number of lines of a text file. A last line without a newline counts. An empty file has 0 lines.
- `findFiles(dir, extension)` returns the paths of all files under `dir`, in sub-folders too, whose name ends with the extension, for example `".md"`. The paths are relative to `dir`, use `/` between the parts, and are sorted alphabetically.
