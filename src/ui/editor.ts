// this is the main editor (left panel)
import { Element } from "./index";
import { options } from "../libs/options";
import { create } from "../libs/elements";
import { keywords } from "../libs/autocomplete";
import * as ace from "ace-builds/src-noconflict/ace";
import * as langTools from "ace-builds/src-noconflict/ext-language_tools";
const acePath = "../../node_modules/ace-builds/src-noconflict";
ace.config.set("basePath", acePath);
ace.config.set("modePath", acePath);
ace.config.set("themePath", acePath);
ace.config.set("modePath", acePath);

langTools.setCompleters([langTools.textCompleter, keywords]);

interface command {
  name: string;
  bindKey: { win: string; mac: string };
  exec?: Function;
}

// TODO: highlight lines with comments starting with TODO
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
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      useSoftTabs: true,
      tabSize: options.editor.tabSize,
      newLineMode: "unix",
      useWorker: true,
      copyWithEmptySelection: true,
    });
    editor.session.on("change", () => {
      if (editor.session.$worker)
        editor.session.$worker.send("setOptions", [
          {
            esversion: 10,
            unused: true,
            varstmt: true,
            debug: true,
            node: true,
          },
        ]);
    });
    this.editor = editor;
    this.element = el;
  }

  listen(name: string, key: string, exec?: Function): void {
    const mac = key.replace(/ctrl/g, "cmd");
    const command: command = {
      name,
      bindKey: { win: key, mac: key },
    };
    if (exec) command.exec = exec;
    this.editor.commands.addCommand(command);
  }

  mode(ext) {
    const session = this.editor.session;
    switch (ext) {
      case "js":
        session.setMode("ace/mode/javascript");
        break;
      case "ts":
        session.setMode("ace/mode/typescript");
        break;
      case "json":
        session.setMode("ace/mode/json");
        break;
      case "md":
        session.setMode("ace/mode/markdown");
        break;
      default:
        session.setMode("ace/mode/text");
        break;
    }
  }
}
