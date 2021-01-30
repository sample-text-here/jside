import { join } from "path";
import * as fs from "fs";
import { remote, ipcRenderer } from "electron";
import { options, paths } from "./options";
ipcRenderer.send("updateRecent");

function recentFile(path: string): void {
  const r = options.recent;
  if (r.indexOf(path) < 0) r.unshift(path);
  if (r.length > options.maxRecent) r.pop();
  ipcRenderer.send("updateRecent");
}

export function saveSketch(value: string): void {
  fs.writeFileSync(paths.sketch, value);
}

export function loadSketch(): string {
  return fs.readFileSync(paths.sketch, "utf8");
}

export function backup(file: string): void {
  fs.writeFileSync(options.backup, file);
}

let samePath = false;

export function saveFile(path: string, value: string): void {
  fs.writeFileSync(path, value);
  if (!samePath) recentFile(path);
  samePath = true;
}

export function openFile(path: string): string {
  samePath = false;
  recentFile(path);
  return fs.readFileSync(path, "utf8");
}

export function fileOpen(): string[] {
  return remote.dialog.showOpenDialogSync({
    title: "open file",
    properties: ["openFile"],
    filters: options.filters,
    defaultPath: options.filesDir,
  });
}

export function fileSave(): string {
  return remote.dialog.showSaveDialogSync({
    title: "save file",
    filters: options.filters,
    defaultPath: options.filesDir,
  });
}

export function lastPath(): string {
  return options.recent[0];
}
