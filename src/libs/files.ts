import { join } from "path";
import * as fs from "fs";
import { remote, ipcRenderer } from "electron";
const dataDir = remote.app.getPath("userData");
const filesDir = join(dataDir, "files");
const sketchPath = join(dataDir, "sketch.js");
const defaultBackupPath = join(dataDir, "backup.js");
const configPath = join(dataDir, "config.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });
if (!fs.existsSync(sketchPath)) fs.writeFileSync(sketchPath, "");
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

interface Settings {
  recent: Array<string>;
  backup: string;
  [x: string]: any;
}

let config: Settings = {
  recent: [],
  backup: defaultBackupPath,
};

function save() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

try {
  config = { ...config, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
} catch (err) {
  save();
}

if (!fs.existsSync(config.backup)) fs.writeFileSync(config.backup, "");
ipcRenderer.send("updateRecent", config.recent);

function recentFile(path: string): void {
  console.log(path);
  const maxItems = 10;
  config.recent = config.recent
    .filter((i) => i !== path)
    .slice(0, maxItems - 1);
  config.recent.unshift(path);
  console.log(config.recent);
  ipcRenderer.send("updateRecent", config.recent);
  save();
}

export function saveSketch(value: string): void {
  fs.writeFileSync(sketchPath, value);
}

export function loadSketch(): string {
  return fs.readFileSync(sketchPath, "utf8");
}

export function backup(file: string): void {
  fs.writeFileSync(config.backup, file);
}

let samePath = false;

export function saveFile(path: string, value: string): void {
  fs.writeFileSync(path, value);
  if (!samePath) recentFile(path);
  samePath = true;
}

export function openFile(path: string): string {
  samePath = false;
  console.log(path);
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
