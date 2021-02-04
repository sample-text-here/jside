import * as fs from "fs";
import { remote } from "electron";
import { options } from "./options";
import { paths } from "./util";

export function saveFile(path: string, value: string): void {
  fs.writeFileSync(path, value);
}

export function openFile(path: string): string {
  return fs.readFileSync(path, "utf8");
}

export function fileOpen(): string {
  return (remote.dialog.showOpenDialogSync({
    title: "open file",
    properties: ["openFile"],
    filters: options.filters,
    defaultPath: options.filesDir,
  }) || [])[0];
}

export function fileSave(): string {
  return remote.dialog.showSaveDialogSync({
    title: "save file",
    filters: options.filters,
    defaultPath: options.filesDir,
  });
}
