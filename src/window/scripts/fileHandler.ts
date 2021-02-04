import * as files from "../../libs/files";
import { basename, extname } from "path";
import { paths, options } from "../../libs/options";
import event from "../../libs/events";
import { Editor } from "../../ui/editor";

const ev = {
  open: event("file.open"),
  save: event("file.save"),
  saveAs: event("file.saveAs"),
  reload: event("reload.force"),
  openedConfig: event("warn.config"),
};

export class FileHandler {
  path: string = null;
  edit: Editor = null;
  updated = false;

  constructor(edit: Editor) {
    this.edit = edit;
  }

  get ext() {
    return extname(this.path).replace(/^\./, "");
  }

  get name() {
    return basename(this.path);
  }

  get value() {
    return this.edit.editor.session.getValue();
  }

  set value(val) {
    this.edit.editor.session.setValue(val);
  }

  confirm() {
    if (!this.updated) return true;
    if (!this.path) return true;
    if (window.confirm("your file isnt saved, continue?")) return true;
    return false;
  }

  openPath(path: string): void {
    if (!path) return;
    if (!this.confirm()) return;
    this.path = path;
    if (path) this.value = files.openFile(path);
    this.edit.mode(this.ext || "js");
    if (path === paths.config) ev.openedConfig.fire();
    files.touch(path);
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
    files.saveFile(this.path, this.value);
    files.touch(this.path);
    if (this.path === paths.config) ev.reload.fire();
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

  backup() {
    const path = this.path ? options.backup : paths.sketch;
    files.saveFile(path, this.value);
  }
}

// TODO: cyclic open/close
// TODO: also ~~fix~~ re-add reopen, it's buggy

// let reopenIndex = 0,
// reopenTimeout = null;

// function open(): void {
// if (!confirmOpen()) return;
// reopenIndex--;
// if (reopenIndex < 0) {
// reopenIndex = -1;
// openPath((files.fileOpen() || [])[0], true);
// return;
// }
// const newPath = options.internal.recent[reopenIndex];
// if (newPath) {
// files.openFileKeepPath(newPath);
// postOpen(newPath);
// clearTimeout(reopenTimeout);
// reopenTimeout = setTimeout(() => {
// files.recentFile(newPath);
// reopenIndex = -1;
// }, 2000);
// return;
// }
// openPath((files.fileOpen() || [])[0], true);
// }

// function reopen(): void {
// reopenIndex++;
// if (reopenIndex >= options.maxRecent) {
// reopenIndex = options.maxRecent - 1;
// }
// const newPath = options.internal.recent[reopenIndex];
// if (newPath) {
// files.openFileKeepPath(newPath);
// postOpen(newPath);
// clearTimeout(reopenTimeout);
// reopenTimeout = setTimeout(() => {
// reopenIndex = -1;
// files.recentFile(newPath);
// }, 2000);
// }
// const newPath = options.internal.recent[filePath ? 1 : 0];
// if (newPath) openPath(newPath);
// }
