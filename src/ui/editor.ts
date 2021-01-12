import { Element } from "./index";
import { create } from "../libs/elements";
import * as ace from "ace-builds/src-noconflict/ace";
import * as langTools from "ace-builds/src-noconflict/ext-language_tools";
const acePath = "../../node_modules/ace-builds/src-noconflict";
ace.config.set("basePath", acePath);
ace.config.set("modePath", acePath);
ace.config.set("themePath", acePath);

langTools.setCompleters([langTools.textCompleter]);

export class Editor extends Element {
  editor;

  constructor(parent: HTMLElement) {
    super();

    // create element
    const el = create("div", ["editor"]);
    el.id = Math.random().toString(36).slice(2);
    el.style.gridArea = "editor";
    parent.append(el);

    // make it an editor
    const editor = ace.edit(el.id);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setShowPrintMargin(false);
    editor.setKeyboardHandler("ace/keyboard/vscode");
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      esversion: 8,
      useSoftTabs: true,
      tabSize: 2,
    });
    this.editor = editor;
    this.element = el;
  }

  listen(name: string, key: string, exec: Function): void {
    const mac = key.replace(/ctrl/g, "cmd");
    this.editor.commands.addCommand({
      name,
      bindKey: { win: key, mac: mac },
      exec,
    });
  }
}
