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
import { Event } from "../libs/events";
import { paths, options } from "../libs/options";

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];
const recordingPopup = new Popup(edit.element, "recording", { dots: true });

bar.element.style.gridArea = "resize";

let filePath = null,
  ext = "js",
  updated = false;

edit.listen("showSettingsMenu", "ctrl-,", () => {
  openPath(paths.config);
  consol.raw("you are editing a config file", "warn");
});

new Event("reload").addListener(() => {
  new Popup(document.body, "reloaded!", { fade: 2000 }).toggle();
  ipcRenderer.send("updateRecent");
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

edit.listen("togglerecording", "ctrl-u", (editor) => {
  editor.commands.toggleRecording(editor);
  recordingPopup.toggle();
});

let numReplays = 0,
  replayTimeout = null;
edit.listen("replaymacro", "ctrl-j", (editor) => {
  editor.commands.replay(editor);
  clearTimeout(replayTimeout);
  numReplays++;
  new Popup(
    edit.element,
    "replay" + (numReplays <= 1 ? "" : " x" + numReplays),
    { fade: 1000 }
  ).toggle();
  replayTimeout = setTimeout(() => {
    numReplays = 0;
  }, 2000);
});

edit.listen("movelinesup", "ctrl-shift-up", (editor) => editor.moveLinesUp());

edit.listen("movelinesdown", "ctrl-shift-down", (editor) =>
  editor.moveLinesDown()
);

edit.listen("copylinesup", "alt-up", (editor) => editor.copyLinesUp());

edit.listen("copylinesdown", "alt-down", (editor) => editor.copyLinesDown());

edit.listen("modifyNumberUp", "alt-shift-up", (editor) =>
  editor.modifyNumber(1)
);

edit.listen("modifyNumberDown", "alt-shift-down", (editor) =>
  editor.modifyNumber(-1)
);

edit.listen("removeline", "ctrl-shift-k", (editor) => editor.removeLines());

edit.listen("touppercase", "", () => {});
edit.listen("tolowercase", "", () => {});

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
    consol.raw("you are editing a config file", "warn");
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
  const newPath = options.internal.recent[0];
  if (newPath && confirmOpen()) files.recentFile(newPath);
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

  if (/^perm-/.test(message)) {
    const [type, toggle] = message.substr(5).split("-");
    vm.setPerm(type, toggle === "on" ? true : false);
    return;
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
