// the main part of the ide

import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { create } from "../libs/elements";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { Popup } from "../ui/popup";
import { formatWithCursor } from "prettier";
import * as vm from "../libs/run";
import * as files from "../libs/files";
import { basename, extname } from "path";
import * as ts from "../libs/compile";
import event from "../libs/events";
import { paths, options, reload } from "../libs/options";
import { rebind } from "./scripts/editorKeybinds";

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];
rebind(edit);

const reloadPopup = new Popup(document.body, "reloaded!", { fade: 2000 });

bar.element.style.gridArea = "resize";

let filePath = null,
  ext = "js",
  updated = false;

edit.listen("showSettingsMenu", "ctrl-,", () => {
  openPath(paths.config);
});

const shouldReload = event("shouldReload");
event("reload").addListener(() => {
  reloadPopup.show();
  reload();
  rebind(edit);
});

edit.editor.session.on("change", () => {
  if (filePath === null) {
    files.saveSketch(edit.editor.session.getValue());
  } else {
    files.backup(edit.editor.session.getValue());
  }
  updated = true;
  updateTitle();
});

// let reopenIndex = 0,
// reopenTimeout = null;

// TODO: make file management less awful
function postOpen(newPath: string): void {
  queueMicrotask(() => {
    updated = false;
    updateTitle();
  });
  filePath = newPath;
  ext = extname(newPath || ".js").replace(/^\./, "");
  if (newPath) edit.editor.session.setValue(files.openFile(newPath));
  edit.mode(ext);
  if (newPath === paths.config)
    consol.createAppender(true, "#e6e155")("you are editing a config file");
}

function confirmOpen() {
  if (updated && filePath && !window.confirm("your file isnt saved, continue?"))
    return false;
  return true;
}

function save(): void {
  if (!filePath) filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
  if (filePath === paths.config) shouldReload.fire();
  files.touch(filePath);
}

function saveAs(): void {
  const newPath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(newPath, edit.editor.session.getValue());
}

function open(): void {
  if (!confirmOpen()) return;
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
  openPath((files.fileOpen() || [])[0], true);
}

function openPath(newPath: string, force = false): void {
  if (!newPath) return;
  if (!force && !confirmOpen()) return;
  postOpen(newPath);
  if (filePath !== newPath) files.touch(newPath);
}

// TODO: cyclic open/close
function reopen(): void {
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
  const newPath = options.internal.recent[filePath ? 1 : 0];
  if (newPath) openPath(newPath);
}

function openSketch(): void {
  if (!confirmOpen()) return;
  edit.editor.session.setValue(files.loadSketch());
  postOpen(null);
}

function format(): void {
  if (ext === "txt") return;
  const editor = edit.editor;
  const cursor = editor.selection.getCursor();
  const index = editor.session.doc.positionToIndex(cursor);
  const value = editor.session.getValue();
  const result = formatWithCursor(value, {
    cursorOffset: index,
    parser: ext === "js" ? "babel" : ext,
  });
  editor.session.doc.setValue(result.formatted);
  const position = editor.session.doc.indexToPosition(result.cursorOffset);
  editor.clearSelection();
  editor.moveCursorToPosition(position);
  updateTitle();
}

bar.dragged = function (e): void {
  const barWidth = 3,
    minX = 0,
    maxX = window.innerWidth - barWidth;
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

vm.setConsole(consol);

consol.run = (code): void => {
  const res = vm.runLess(code);
  consol[res.err ? "error" : "log"](res.value);
  updateTitle();
};

function run(): void {
  const code = edit.editor.session.getValue();
  console.log(ext);
  switch (ext) {
    case "js":
      const res = vm.run(code);
      consol[res.err ? "error" : "log"](res.value);
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
      save();
      break;
    case "saveAs":
      saveAs();
      break;
    case "open":
      open();
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
      reopen();
      break;
    case "sketch":
      openSketch();
      break;
    case "showFile":
      if (filePath) ipcRenderer.send("showFile", filePath);
      break;
  }
});

ipcRenderer.on("openRecent", (e, path) => {
  openPath(path);
});

function updateTitle(): void {
  let title = "jside";
  if (filePath) {
    title += " - " + basename(filePath) + (updated ? "*" : "");
  }
  document.title = title;
}

edit.editor.session.doc.setValue(files.loadSketch());
