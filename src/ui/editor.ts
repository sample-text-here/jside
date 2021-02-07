// this is the main editor (left panel)
import { Element } from "./index";
import { options } from "../libs/options";
import { fileTypes } from "../libs/util";
import { create } from "../libs/elements";
import langs from "../langs";
import * as ace from "ace-builds/src-noconflict/ace";
import * as langTools from "ace-builds/src-noconflict/ext-language_tools";
const acePath = "../../node_modules/ace-builds/src-noconflict";
ace.config.set("basePath", acePath);
ace.config.set("modePath", acePath);
ace.config.set("themePath", acePath);
ace.config.set("modePath", acePath);

interface command {
  name: string;
  bindKey: { win: string; mac: string };
  exec?: Function;
}

const defaults = {
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
  useSoftTabs: true,
  tabSize: options.editor.tabSize,
  newLineMode: "unix",
  useWorker: true,
  copyWithEmptySelection: true,
  showPrintMargin: false,
};

const workerDefaults = {
  esversion: 10,
  unused: true,
  varstmt: true,
  debug: true,
  node: true,
};

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
    editor.setOptions(defaults);
    this.editor = editor;
    this.element = el;

    // set the worker on change
    editor.session.on("change", () => {
      const worker = editor.session.$worker;
      if (worker) worker.send("setOptions", [workerDefaults]);
    });
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
    const fileType = fileTypes.find((i) => i.exts.includes(ext)) || {
      name: "text",
      autocomplete: false,
    };
    const completers = [];
    // session.setMode(`ace/mode/${"customLang" in fileType ? "text" : fileType.name}`);
    session.setMode(`ace/mode/${fileType.name.replace(/\s/g, "-")}`);
    if (fileType.autocomplete) {
      completers.push(langTools.textCompleter);
      if (fileType.exts[0] in langs) {
        completers.push(langs[fileType.exts[0]]);
      }
    }
    langTools.setCompleters(completers);
  }
}
