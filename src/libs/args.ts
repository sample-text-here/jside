import { existsSync } from "fs";

export function parse() {
  let file = null,
    options = [];
  for (let i of process.argv) {
    if (/^--/.test(i)) {
      options.push(i.substr(2));
    } else if (existsSync(i)) {
      file = i;
    }
  }
  return { file, options };
}
