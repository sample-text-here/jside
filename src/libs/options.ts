// save and load options

import { join } from "path";
import { NodeVM } from "vm2";
import { deepCopy, matches, assign } from "./util";
import * as fs from "fs";
import { app as _app, remote } from "electron";
const app = _app || remote.app;
export const dataDir = app.getPath("userData");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const paths = {
  internal: join(dataDir, "internal.json"),
  sketch: join(dataDir, "sketch.js"),
  config: join(dataDir, "config.js"),
};

if (!fs.existsSync(paths.sketch)) fs.writeFileSync(paths.sketch, "");
if (!fs.existsSync(paths.internal)) fs.writeFileSync(paths.internal, "{}");
if (!fs.existsSync(paths.config)) {
  fs.writeFileSync(paths.config, "// config goes here\n\nmodule.exports = {}");
}

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
      open: "ctrl-s",
      save: "ctrl-o",
      saveAs: "ctrl-shift-s",
      openRecent: "ctrl-shift-o",
      showFile: "ctrl-shift-e",
      sketchpad: "ctrl-alt-o",
      quit: "ctrl-q",
    },
  },
  internal: {
    recent: [],
  },
  backup: join(dataDir, "backup.js"),
  filesDir: join(dataDir, "files"),
  maxRecent: 10,
};

export const options: Options = deepCopy<Options>(defaultOptions);

function isOptions(obj: Object): obj is Options {
  return matches(obj, defaultOptions);
}

export function save() {
  fs.writeFileSync(paths.internal, JSON.stringify(options.internal));
}

const vm = new NodeVM({
  require: {
    external: false,
    builtin: ["*"],
  },
});

export function reload(): void {
  const newOpts: Options = deepCopy<Options>(defaultOptions);
  try {
    const json = JSON.parse(fs.readFileSync(paths.internal, "utf8"));
    if (typeof json !== "object") throw "not object";
    if (!json) throw "is null";
    assign(newOpts.internal, json);
  } catch {
    fs.writeFileSync(paths.internal, "{}");
  }

  try {
    const toEval = fs.readFileSync(paths.config, "utf8");
    const result = vm.run(toEval);
    if (typeof result !== "object") throw "result not an object";
    if (!result) throw "result is null";
    assign(newOpts, result);
  } catch {}

  const allFilters: Array<string> = [];
  for (let i of newOpts.filters) {
    allFilters.push(...i.extensions);
  }
  newOpts.filters.push({ name: "all", extensions: allFilters });

  if (!isOptions(options)) throw "invalid options";
  Object.assign(options, newOpts);

  if (!fs.existsSync(options.filesDir)) {
    fs.mkdirSync(options.filesDir, { recursive: true });
  }
}

reload();
