// i often dont know what to do
// if u want to contribute, run this file first

const { readFileSync, readdirSync, lstatSync } = require("fs");
const { resolve, join } = require("path");

function walk(dir) {
  const files = [];
  const folders = [];
  const abs = resolve(dir);
  for (const item of readdirSync(abs)) {
    if (lstatSync(join(abs, item)).isDirectory()) {
      folders.push(join(dir, item));
    } else {
      files.push(join(dir, item));
    }
  }
  for (const dir of folders) {
    files.push(...walk(dir));
  }
  return files;
}

function findTodos(file) {
  file = file.split("\n");
  const results = [];
  for (const line in file) {
    const hasTodo = file[line].trim().match(/\/\/ ?todo.+/gi);
    if (!hasTodo) continue;
    results.push({ line, text: hasTodo[0] });
  }
  if (results.length === 0) return [];
  return results.map((i) => `${String(i.line).padStart(3)}: ${i.text}`);
}

let todos = [];
for (const file of walk("src")) {
  const content = readFileSync(file, "utf8");
  let found = findTodos(content);
  if (found.length > 0) {
    todos.push(`${file}\n${found.join("\n")}`);
  }
}
if (todos.length > 0) {
  console.log(todos.join("\n\n"));
} else {
  console.log("nothing to do!");
}
