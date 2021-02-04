// TODO: use this file instead
import { options } from "../../libs/options";
import { Bind } from "../../libs/keybind";
import { Popup } from "../../ui/popup";

function isValid(bind: string): boolean {
  return new Bind(bind).isValid();
}

interface Actions {
  [key: string]: (editor) => void;
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
};

export class Keybinds {
  private readonly record: Popup;
  private readonly replay: Popup;
  private replays = 0;
  private timeout = null;
  private edit;

  constructor(edit, binds) {
    this.record = new Popup(edit.element, "recording", { dots: true });
    this.replay = new Popup(edit.element, "", { fade: 1000 });
    this.edit = edit;
    this.rebind(binds);
  }

  rebind(binds) {
    const edit = this.edit;
    for (let i in binds) {
      if (!isValid(binds[i])) continue;
      if (!Object.hasOwnProperty.call(actions, i)) continue;
      edit.listen(i, binds[i], actions[i]);
    }
    edit.listen("togglerecording", binds.togglerecording, (editor) => {
      editor.commands.toggleRecording(editor);
      this.record.toggle();
    });
    edit.listen("replaymacro", binds.replaymacro, (editor) => {
      editor.commands.replay(editor);
      clearTimeout(this.timeout);
      this.replays++;
      this.replay.text(
        "replay" + (this.replays <= 1 ? "" : " x" + this.replays)
      );
      this.replay.show();
      this.timeout = setTimeout(() => {
        this.replays = 0;
      }, 2000);
    });
  }
}
