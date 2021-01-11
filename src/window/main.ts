import { ipcRenderer } from "electron";
import { Editor } from "../ui/editor";
import { Console } from "../ui/console";
import { Bar } from "../ui/dragBar";
import { formatWithCursor as format } from "prettier";
import { run } from "../libs/run";

const main = document.getElementById("main");
const [edit, bar, consol] = [
  new Editor(main),
  new Bar(main, "leftRight"),
  new Console(main),
];

bar.element.style.gridArea = "resize";

edit.listen("save", "ctrl-s", (editor) => {
  console.log("saving", editor.session.getValue());
});

edit.listen("open", "ctrl-o", () => {
  console.log("open");
});

edit.listen("format", "ctrl-alt-s", (editor) => {
  const result = format(editor.session.getValue(), {
    cursorOffset: editor.session.doc.positionToIndex(
      editor.selection.getCursor()
    ),
  }, {parser: "babel"});
  editor.session.setValue(result.formatted, -1);
  editor.moveCursorToPosition(
    editor.session.doc.indexToPosition(result.cursorOffset)
  );
});

ipcRenderer.on("runCode", (e) => {
  const res = run(edit.editor.session.getValue());
  consol.log(res);
});
