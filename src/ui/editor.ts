import { Element } from "./index";
import * as ace from "ace-builds/src-noconflict/ace";
ace.config.set("basePath", "../../node_modules/ace-builds/src-noconflict");
ace.config.set("modePath", "../../node_modules/ace-builds/src-noconflict");
ace.config.set("themePath", "../../node_modules/ace-builds/src-noconflict");

export class Editor extends Element {
  editor: unknown;
  constructor(el: HTMLElement) {
    super();
    if (!el.id) el.id = Math.random().toString(36).slice(2);
    const editor = ace.edit(el.id);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setShowPrintMargin(false);
    editor.setKeyboardHandler("ace/keyboard/vscode");
    this.editor = editor;
    this.element = el;
  }
}
