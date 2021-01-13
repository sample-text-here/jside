import { join } from "path";
import * as fs from "fs";
import { remote, ipcRenderer } from "electron";
const dataDir = remote.app.getPath("userData");
const filesDir = join(dataDir, "files");
const sketchPath = join(dataDir, "sketch.js");
const configPath = join(dataDir, "config.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });
if (!fs.existsSync(sketchPath)) fs.writeFileSync(sketchPath, "");
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

interface Settings {
  recent: Array<string>;
  flat: boolean;
}
let config = {} as Settings;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8")) as Settings;
} catch (err) {
  fs.writeFileSync(configPath, "{}");
}

function init(key, value) {
  if (!(key in config)) config[key] = value;
}

function save() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

init("recent", []);
save();
ipcRenderer.send("updateRecent", config.recent);

function recentFile(path) {
  const maxItems = 10;
  config.recent = config.recent
    .filter((i) => i !== path)
    .slice(0, maxItems - 1);
  config.recent.unshift(path);
  ipcRenderer.send("updateRecent", config.recent);
  save();
}

export function saveSketch(value): void {
  fs.writeFileSync(sketchPath, value);
}

export function loadSketch(): string {
  return fs.readFileSync(sketchPath, "utf8");
}

let samePath = false;

export function saveFile(path, value): void {
  fs.writeFileSync(path, value);
  if (!samePath) recentFile(path);
  samePath = true;
}

export function openFile(path): string {
  samePath = false;
  recentFile(path);
  return fs.readFileSync(path, "utf8");
}

export function fileOpen(): string[] {
  return remote.dialog.showOpenDialogSync({
    title: "open file",
    properties: ["openFile"],
    filters: [{ name: "js", extensions: ["js"] }],
    defaultPath: filesDir,
  });
}

export function fileSave(): string {
  return remote.dialog.showSaveDialogSync({
    title: "save file",
    filters: [{ name: "js", extensions: ["js"] }],
    defaultPath: filesDir,
  });
}

export function lastPath(): string {
  return config.recent[0];
}
