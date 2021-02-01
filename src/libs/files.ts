import { join } from "path";
import * as fs from "fs";
import { remote, ipcRenderer } from "electron";
import { options, paths, save } from "./options";
ipcRenderer.send("updateRecent");

export function recentFile(path: string): void {
  const r = options.internal.recent;
  if (r.indexOf(path) >= 0) r.splice(r.indexOf(path), 1);
  r.unshift(path);
  if (r.length > options.maxRecent) r.pop();
  save();
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

export function openFileKeepPath(path: string): string {
  return fs.readFileSync(path, "utf8");
}

export function saveFileKeepPath(path: string, value: string): void {
  fs.writeFileSync(path, value);
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
