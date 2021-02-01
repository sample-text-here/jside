// TODO: use this file instead
import { options } from "../../libs/options";
import { Bind } from "../../libs/keybind";
import { Popup } from "../../ui/popup";

let recordingPopup: Popup,
  replayPopup: Popup,
  numReplays = 0,
  replayTimeout = null;

function isValid(bind) {
  return new Bind(bind).isValid();
}

export const actions = {
  movelinesup: (editor) => editor.moveLinesUp(),
  movelinesdown: (editor) => editor.moveLinesDown(),
  copylinesup: (editor) => editor.copyLinesUp(),
  copylinesdown: (editor) => editor.copyLinesDown(),
  modifyNumberUp: (editor) => editor.modifyNumber(1),
  modifyNumberDown: (editor) => editor.modifyNumber(-1),
  removeline: (editor) => editor.removeLines(),
  touppercase: (editor) => editor.toUpperCase(),
  tolowercase: (editor) => editor.toLowerCase(),
  gotoline: (editor, line) => {
    if (typeof line === "number" && !isNaN(line)) editor.gotoLine(line);
    editor.prompt({ $type: "gotoLine" });
  },
  fold: (editor) => editor.session.toggleFold(false),
  unfold: (editor) => editor.session.toggleFold(true),
  toggleFoldWidget: (editor) => editor.toggleFoldWidget(),
  foldall: (editor) => editor.session.unfold(),
  unfoldall: (editor) => editor.session.foldAll(),
  findnext: (editor) => editor.findNext(),
  findprevious: (editor) => editor.findPrevious(),
  jumptomatching: (editor) => editor.jumpToMatching(),
  selecttomatching: (editor) => editor.jumpToMatching(true),
  openCommandPallete: (editor) => editor.prompt({ $type: "commands" }),
  togglerecording: (editor) => {
    editor.commands.toggleRecording(editor);
    recordingPopup.toggle();
  },
  replaymacro: (editor) => {
    editor.commands.replay(editor);
    clearTimeout(replayTimeout);
    numReplays++;
    replayPopup.text("replay" + (numReplays <= 1 ? "" : " x" + numReplays));
    replayPopup.show();
    replayTimeout = setTimeout(() => {
      numReplays = 0;
    }, 2000);
  },
};

export function rebind(edit) {
  if (recordingPopup) recordingPopup.dispose();
  if (replayPopup) replayPopup.dispose();
  recordingPopup = new Popup(edit.element, "recording", { dots: true });
  replayPopup = new Popup(edit.element, "", { fade: 1000 });
  const binds = options.keybinds.editor;
  for (let i in binds) {
    if (!isValid(binds[i])) continue;
    if (!Object.hasOwnProperty.call(actions, i)) continue;
    edit.listen(i, binds[i], actions[i]);
  }
}
