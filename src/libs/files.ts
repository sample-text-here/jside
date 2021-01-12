import { join } from "path";
import * as fs from "fs";
import { remote } from "electron";
const dataDir = remote.app.getPath("userData");
const sketchPath = join(dataDir, "sketch.js");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(sketchPath)) fs.writeFileSync(sketchPath, "");

export function saveSketch(value) {
  fs.writeFileSync(sketchPath, value);
}

export function loadSketch() {
  return fs.readFileSync(sketchPath, "utf8");
}
