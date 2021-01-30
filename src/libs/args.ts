import { app } from "electron";
import { existsSync } from "fs";

export function parse() {
  let file = null;
  const options = [];
  for (let i of process.argv.slice(app.isPackaged ? 1 : 2)) {
    if (/^--/.test(i)) {
      options.push(i.substr(2));
    } else if (existsSync(i)) {
      file = i;
    }
  }
  return { file, options };
}
