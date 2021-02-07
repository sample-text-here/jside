import * as files from "../../libs/files";
import { basename, extname } from "path";
import { options } from "../../libs/options";
import * as util from "../../libs/util";
import event from "../../libs/events";

const ev = {
  open: event("file.open"),
  save: event("file.save"),
  saveAs: event("file.saveAs"),
  reload: event("reload.force"),
  openedConfig: event("warn.config"),
};

export interface EditorHook {
  getValue: () => string;
  setValue: (string) => void;
}

export class FileHandler {
  path: string = "";
  hook: EditorHook;
  updated = false;

  constructor(hook: EditorHook) {
    this.hook = hook;
  }

  get ext(): string {
    return this.path ? extname(this.path).replace(/^\./, "") : "js";
  }

  get name(): string {
    return this.path ? basename(this.path) : "";
  }

  confirm(): boolean {
    if (!this.updated) return true;
    if (!this.path) return true;
    if (window.confirm("your file isnt saved, continue?")) return true;
    return false;
  }

  openPath(path: string): void {
    if (!path) return;
    if (!this.confirm()) return;
    this.path = path;
    if (path) this.hook.setValue(files.openFile(path));
    if (path === util.paths.config) ev.openedConfig.fire();
    if (path === util.paths.sketch) this.path = null;
    this.updated = false;
    ev.open.fire(path);
  }

  open(): void {
    if (!this.confirm()) return;
    const oldPath = this.path;
    this.path = null;
    this.openPath(files.fileOpen());
    if (!this.path) this.path = oldPath;
  }

  save(): void {
    if (!this.path) this.path = files.fileSave();
    if (!this.path) return;
    this.updated = false;
    files.saveFile(this.path, this.hook.getValue());
    if (this.path === util.paths.config) ev.reload.fire();
    ev.save.fire(this.path);
  }

  saveAs(): void {
    const oldPath = this.path;
    this.path = null;
    this.save();
    if (!this.path) {
      this.path = oldPath;
    } else {
      ev.saveAs.fire(this.path);
    }
  }

  backup(): void {
    const path = this.path ? options.backup : util.paths.sketch;
    files.saveFile(path, this.hook.getValue());
  }
}
