// save and load options

import { join } from "path";
import { NodeVM } from "vm2";
import * as util from "./util";
import * as fs from "fs";

interface Options {
  filters: Array<{ name: string; extensions: Array<string> }>;
  theme: Record<string, Record<string, string> | string>;
  keybinds: {
    [key: string]: Record<string, string>;
  };
  backup: string;
  filesDir: string;
  maxRecent: number;
  internal: {
    recent: Array<string>;
    [key: string]: any;
  };
}

const defaultOptions: Options = {
  filters: [
    { name: "javascript", extensions: ["js"] },
    { name: "json", extensions: ["json"] },
    { name: "markdown", extensions: ["md"] },
    { name: "text", extensions: ["txt"] },
  ],
  theme: {
    isDark: "true",
    main: {
      foreground: "",
      background: "#272822",
      accent: "",
      selection: "",
    },
    editor: {
      gutter: "",
      currentLine: "#272727",
    },
    highlight: {
      comment: "",
      keyword: "",
      number: "",
      string: "",
      parenthase: "",
    },
  },
  keybinds: {
    editor: {
      fold: "ctrl-f1",
      unfold: "ctrl-shift-f1",
      toggleFoldWidget: "f2",
      foldall: "ctrl-alt-0",
      unfoldall: "ctrl-alt-shift-0",
      findnext: "ctrl-i",
      findprevious: "ctrl-shift-i",
      jumptomatching: "ctrl-\\",
      selecttomatching: "ctrl-shift-\\",
      openCommandPallete: "f1",
      movelinesup: "ctrl-shift-up",
      movelinesdown: "ctrl-shift-down",
      copylinesup: "alt-up",
      copylinesdown: "alt-down",
      modifyNumberUp: "alt-shift-up",
      modifyNumberDown: "alt-shift-down",
      removeline: "ctrl-shift-k",
      touppercase: "",
      tolowercase: "",
      togglerecording: "ctrl-u",
      replaymacro: "ctrl-j",
    },
    code: {
      run: "ctrl-enter",
      clear: "ctrl-l",
      format: "ctrl-alt-s",
    },
    files: {
      open: "ctrl-o",
      save: "ctrl-s",
      saveAs: "ctrl-shift-s",
      reopen: "ctrl-shift-o",
      showFile: "ctrl-shift-e",
      sketchpad: "ctrl-alt-o",
      new: "ctrl-n",
      quit: "ctrl-q",
      config: "ctrl-,",
    },
  },
  internal: {
    recent: [],
  },
  backup: join(util.paths.data, "backup.js"),
  filesDir: join(util.paths.data, "files"),
  maxRecent: 10,
};

export const options: Options = util.deepCopy<Options>(defaultOptions);

function isOptions(obj: Record<string, any>): obj is Options {
  return util.matches(obj, defaultOptions);
}

export function save() {
  fs.writeFileSync(util.paths.internal, JSON.stringify(options.internal));
}

const vm = new NodeVM({
  require: {
    external: false,
    builtin: ["*"],
  },
});

export function reload(): void {
  const newOpts: Options = util.deepCopy<Options>(defaultOptions);

  try {
    const json = JSON.parse(fs.readFileSync(util.paths.internal, "utf8"));
    if (typeof json !== "object") throw "not object";
    if (!json) throw "is null";
    util.assign(newOpts.internal, json);
  } catch {
    fs.writeFileSync(util.paths.internal, "{}");
  }

  try {
    const toEval = fs.readFileSync(util.paths.config, "utf8");
    const result = vm.run(toEval);
    if (typeof result !== "object") throw "result not an object";
    if (!result) throw "result is null";
    util.assign(newOpts, result);
  } catch (err) {
    console.error(err);
  }

  const allFilters: Array<string> = [];
  for (const i of newOpts.filters) {
    allFilters.push(...i.extensions);
  }
  newOpts.filters.push({ name: "all", extensions: allFilters });

  if (!isOptions(newOpts)) throw "invalid options";
  Object.assign(options, newOpts);

  if (!fs.existsSync(options.filesDir)) {
    fs.mkdirSync(options.filesDir, { recursive: true });
  }
}

reload();
