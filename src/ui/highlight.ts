import { Element } from "./index";
import { create } from "../libs/elements";
import { Editor } from "./editor";

export class Highlight extends Element {
  constructor(parent: HTMLElement, data: string) {
    super();
    const element = create("div", ["highlighted"]);
    parent.append(element);
    const e = new Editor(element);
    e.editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
      enableLiveAutocompletion: false,
      showGutter: false,
      readOnly: true,
      maxLines: 100,
      highlightActiveLine: false,
      highlightGutterLine: false,
    });
    e.editor.textInput.getElement().disabled = true;
    e.editor.commands.commmandKeyBinding = {};
    e.editor.renderer.$cursorLayer.element.style.display = "none";
    e.editor.session.setValue(data);
    this.element = element;
  }
}
