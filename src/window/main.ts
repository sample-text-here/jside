// the main part of the ide

import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { formatWithCursor } from "prettier";
import * as vm from "../libs/run";
import * as files from "../libs/files";
import { basename } from "path";
import * as ts from "../libs/compile";

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];
declare global {
  interface Window {
    asdf: any;
  }
}
window.asdf = edit;
bar.element.style.gridArea = "resize";

let filePath = null,
  updated = false;

edit.editor.session.on("change", () => {
  if (filePath === null) {
    files.saveSketch(edit.editor.session.getValue());
  } else {
    files.backup(edit.editor.session.getValue());
  }
  updated = true;
  updateTitle();
});

edit.editor.commands.addCommand({
  name: "alsoRedo",
  bindKey: { win: "ctrl+shift+z", mac: "cmd+shift+z" },
  exec(editor) {
    editor.redo();
  },
});

function save(): void {
  if (!filePath) filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
}

function saveAs(): void {
  filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
}

function open(): void {
  if (updated && filePath && !window.confirm("your file isnt saved, continue?"))
    return;
  openPath((files.fileOpen() || [])[0], true);
}

function openPath(newPath: string, force = false): void {
  if (!newPath) return;
  if (
    updated &&
    filePath &&
    !force &&
    !window.confirm("your file isnt saved, continue?")
  )
    return;
  queueMicrotask(() => {
    updated = false;
    updateTitle();
  });
  filePath = newPath;
  edit.editor.session.setValue(files.openFile(newPath));
}

function reopen(): void {
  const lastPath = files.lastPath();
  if (lastPath) openPath(lastPath);
}

function openSketch(): void {
  if (updated && filePath && !window.confirm("your file isnt saved, continue?"))
    return;
  filePath = null;
  edit.editor.session.setValue(files.loadSketch());
  queueMicrotask(() => {
    updated = false;
    updateTitle();
  });
}

function format(): void {
  const editor = edit.editor;
  const cursor = editor.selection.getCursor();
  const index = editor.session.doc.positionToIndex(cursor);
  const value = editor.session.getValue();
  const result = formatWithCursor(value, {
    cursorOffset: index,
    parser: "babel",
  });
  editor.session.doc.setValue(result.formatted);
  const position = editor.session.doc.indexToPosition(result.cursorOffset);
  editor.clearSelection();
  editor.moveCursorToPosition(position);
}

bar.dragged = function (e): void {
  const barWidth = 3,
    minX = 0,
    maxX = window.innerWidth - barWidth;
  let newX = e.clientX;
  if (newX < minX) newX = minX;
  if (newX > maxX) newX = maxX;
  main.style.gridTemplateColumns = `${newX}px ${barWidth}px 2fr`;
  const atEdge = newX === minX || newX === maxX;
  bar.element.style.opacity = String(atEdge ? 0 : 1);
  edit.editor.resize();
  consol.resize();
};

vm.setConsole(consol);

consol.run = (code): void => {
  const res = vm.runLess(code);
  consol[res.err ? "error" : "log"](res.value);
};

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
      const res = vm.run(edit.editor.session.getValue());
      consol[res.err ? "error" : "log"](res.value);
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
  if (filePath) {
    document.title = "jside - " + basename(filePath) + (updated ? "*" : "");
  } else {
    document.title = "jside";
  }
}

edit.editor.session.doc.setValue(files.loadSketch());
