// the main part of the ide

import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { formatWithCursor } from "prettier";
import * as vm from "../libs/run";
import * as files from "../libs/files";
import { basename } from "path";
const permissions: Record<string, boolean> = {};

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];

bar.element.style.gridArea = "resize";

let filePath = null,
  updated = false;

edit.editor.session.on("change", () => {
  files.saveSketch(edit.editor.session.getValue());
  updated = true;
  updateTitle();
});

function save() {
  if (!filePath) filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
}

function saveAs() {
  filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
}

function open() {
  if (updated && filePath && !window.confirm("your file isnt saved, continue?"))
    return;
  filePath = files.fileOpen()[0];
  if (!filePath) return;
  queueMicrotask(() => {
    updated = false;
    updateTitle();
  });
  edit.editor.session.setValue(files.openFile(filePath));
}

function format() {
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
  editor.moveCursorToPosition(position);
}

bar.dragged = function (e) {
  const barWidth = 3,
    minX = 0,
    maxX = window.innerWidth - barWidth;
  let newX = e.clientX;
  if (newX < minX) newX = minX;
  if (newX > maxX) newX = maxX;
  main.style.gridTemplateColumns = `${newX}px ${barWidth}px 1fr`;
  const atEdge = newX === minX || newX === maxX;
  bar.element.style.opacity = String(atEdge ? 0 : 1);
  edit.editor.resize();
};

vm.setConsole(consol);

consol.run = (code) => {
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
  }
  if (message.substr(0, 5) === "perm-") {
    const [type, toggle] = message.substr(5).split("-");
    vm.setPerm(type, toggle === "on" ? true : false);
  }
});

function updateTitle(): void {
  if (filePath) {
    document.title = "jside - " + basename(filePath) + (updated ? "*" : "");
  } else {
    document.title = "jside";
  }
}

edit.editor.session.doc.setValue(files.loadSketch());
