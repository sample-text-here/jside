import * as files from "../../libs/files";
import { basename, extname } from "path";
import { options } from "../../libs/options";
import * as util from "../../libs/util";
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

  get ext(): string {
    return extname(this.path).replace(/^\./, "");
  }

  get name(): string {
    return basename(this.path);
  }

  get value(): string {
    return this.edit.editor.session.getValue();
  }

  set value(val) {
    this.edit.editor.session.setValue(val);
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
    if (path) this.value = files.openFile(path);
    this.edit.mode(this.ext || "js");
    if (path === util.paths.config) ev.openedConfig.fire();
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
    files.saveFile(path, this.value);
  }
}
