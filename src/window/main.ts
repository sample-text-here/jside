// the main part of the ide

import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { create } from "../libs/elements";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { Popup } from "../ui/popup";
import { formatWithCursor } from "prettier";
import { run as runInVm, VirtualMachine } from "../libs/run";
import * as ts from "../libs/compile";
import event from "../libs/events";
import { options, reload, save } from "../libs/options";
import { paths, args, fileTypes } from "../libs/util";
import { Keybinds } from "./scripts/editorKeybinds";
import { FileHandler, EditorHook } from "./scripts/fileHandler";
import { PluginManager } from "./scripts/pluginManager";

const main = document.getElementById("main");
const edit = new Editor(main);
const bar = new Bar(main, "leftRight");
const consol = new Console(main);
const reloadPopup = new Popup(document.body, "reloaded!", { fade: 1000 });
bar.element.style.gridArea = "resize";

const editInterface: EditorHook = {
  getValue(): string {
    return edit.editor.session.getValue();
  },

  setValue(val: string) {
    edit.editor.session.setValue(val);
  },
};

const vm = new VirtualMachine();
const files = new FileHandler(editInterface);
const keybinds = new Keybinds(edit, options.keybinds.editor);
const recent = options.internal.recent;
const ev = {
  showFile: event("showFile", true),
  openedConfig: event("warn.config"),
  reload: event("reload", true),
  reloadRecent: event("reload.recent", true),
  open: event("file.open"),
};

// TODO: plugins
// these are a work in progress and DO NOT WORK yet
// do not try to use them
if (args.has("dev")) {
  const pluginManager = new PluginManager(
    {
      window,
      electron: require("electron"),
      event,
    },
    consol
  );
  pluginManager.load();
}

ev.openedConfig.addListener(() => {
  consol.createAppender(true, "#e6e155")("you are editing a config file");
});

ev.reload.addListener(() => {
  reloadPopup.show();
  reload();
  keybinds.rebind(options.keybinds.editor);
  edit.listen("showSettingsMenu", options.keybinds.files.config, () => {
    files.openPath(paths.config);
  });
});

ev.open.addListener(() => {
  files.updated = false;
  updateTitle();
  edit.mode(files.ext || "js");

  // ace editor bug
  window.blur();
  queueMicrotask(window.focus);
});

edit.editor.session.on("change", () => {
  files.backup();
  files.updated = true;
  updateTitle();
});

function touch(path) {
  if (!path) return;
  const index = recent.indexOf(path);
  if (index >= 0) recent.splice(index, 1);
  while (recent.length > options.maxRecent) recent.pop();
  recent.unshift(path);
  save();
  ev.reloadRecent.fire();
}

let reopenIndex = -1;
let reopenTimeout;
function openThing(reopen = false): void {
  clearTimeout(reopenTimeout);
  reopenIndex += reopen ? 1 : -1;
  reopenIndex = Math.min(reopenIndex, recent.length - 1);
  if (reopenIndex < 0) {
    files.open();
    touch(files.path);
    reopenIndex = 0;
    return;
  }
  files.openPath(recent[reopenIndex]);
  reopenTimeout = setTimeout(() => {
    touch(files.path);
    reopenIndex = 0;
  }, 1000);
}

function format(): void {
  const found = fileTypes.find((i) => i.exts.includes(files.ext));
  if (!found) return;
  if (!("parse" in found)) return;
  const session = edit.editor.session;
  const cursor = edit.editor.selection.getCursor();
  const index = session.doc.positionToIndex(cursor);
  const value = session.getValue();
  const result = formatWithCursor(value, {
    cursorOffset: index,
    parser: found.parse,
    tabWidth: options.editor.tabSize,
  });
  const position = session.doc.indexToPosition(result.cursorOffset);
  session.doc.setValue(result.formatted);
  edit.editor.clearSelection();
  edit.editor.moveCursorToPosition(position);
}

bar.dragged = function (e): void {
  const barWidth = 3,
    minX = 0,
    maxX = window.innerWidth;
  let newX = e.clientX;
  if (newX < minX) newX = minX;
  if (newX > maxX) newX = maxX;
  main.style.gridTemplateColumns = `3fr ${barWidth}px ${
    window.innerWidth - newX
  }px`;
  const atEdge = newX === minX || newX === maxX;
  bar.element.style.opacity = String(atEdge ? 0 : 1);
  edit.editor.resize();
  consol.resize();
};

vm.console = consol;

consol.run = (code): void => {
  const res = runInVm(code);
  consol[res.err ? "error" : "log"](res.result);
  updateTitle();
};

// TODO: replace console with markdown preview when there are compatable files
function run(): void {
  const code = editInterface.getValue();
  switch (files.ext) {
    case "js":
      const res = vm.run(code);
      consol[res.err ? "error" : "log"](res.result);
      break;
    case "json":
      try {
        consol.log(JSON.parse(code));
      } catch (err) {
        consol.error(err);
      }
      break;
  }
}

ipcRenderer.on("menu", (e, message) => {
  switch (message) {
    case "save":
      files.save();
      touch(files.path);
      break;
    case "saveAs":
      files.saveAs();
      touch(files.path);
      break;
    case "open":
      openThing();
      break;
    case "format":
      format();
      break;
    case "run":
      run();
      break;
    case "clear":
      consol.clear();
      break;
    case "reopen":
      openThing(true);
      break;
    case "sketchpad":
      files.openPath(paths.sketch);
      reopenIndex = -1;
      break;
    case "config":
      files.openPath(paths.config);
      break;
    case "showFile":
      if (files.path) ev.showFile.fire(files.path);
      break;
  }
  updateTitle();
});

ipcRenderer.on("openRecent", (e, path) => {
  files.openPath(path);
  touch(files.path);
});

function updateTitle(): void {
  let title = "jside";
  if (files.path) {
    title += " - " + files.name;
    if (files.updated) title += "*";
  }
  document.title = title;
}

files.openPath(paths.sketch);
window.focus();
