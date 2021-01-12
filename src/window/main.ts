import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { formatWithCursor as format } from "prettier";
import { run } from "../libs/run";
import { saveSketch, loadSketch } from "../libs/files";

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];

bar.element.style.gridArea = "resize";

edit.editor.session.on("change", () =>
  saveSketch(edit.editor.session.getValue())
);

edit.listen("save", "ctrl-s", (editor) => {
  console.log("saving", editor.session.getValue());
});

edit.listen("open", "ctrl-o", () => {
  console.log("open");
});

edit.listen("format", "ctrl-alt-s", (editor) => {
  const cursor = editor.selection.getCursor();
  const index = editor.session.doc.positionToIndex(cursor);
  const value = editor.session.getValue();
  const result = format(value, { cursorOffset: index, parser: "babel" });
  editor.session.doc.setValue(result.formatted, -1);
  const position = editor.session.doc.indexToPosition(result.cursorOffset);
  editor.moveCursorToPosition(position);
});

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

ipcRenderer.on("runCode", (e) => {
  const res = run(edit.editor.session.getValue());
  consol.log(res);
});

edit.editor.session.doc.setValue(loadSketch(), -1);
