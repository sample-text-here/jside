import { join } from "path";
import * as fs from "fs";
import { remote } from "electron";
import event from "../libs/events";
import { options, paths, save } from "./options";

const updateEv = event("updateRecent");
export function touch(path: string): void {
  const r = options.internal.recent;
  if (r.indexOf(path) >= 0) r.splice(r.indexOf(path), 1);
  r.unshift(path);
  if (r.length > options.maxRecent) r.pop();
  save();
  updateEv.fire();
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

export function saveFile(path: string, value: string): void {
  fs.writeFileSync(path, value);
}

export function openFile(path: string): string {
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
