// save and load options
import { join } from "path";
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

function deepCopyArray(arr: Array<any>) {
  const out: Array<any> = [];
  for (let i of arr) {
    if (i && typeof i === "object") {
      if (i instanceof Array) {
        out.push(deepCopyArray(i));
      } else {
        out.push(deepCopy<Object>(i));
      }
    } else {
      out.push(i);
    }
  }
  return out;
}

function deepCopy<T = Object>(obj: Object): T {
  const out = {};
  for (let i in obj) {
    if (obj[i] && typeof obj[i] === "object") {
      if (obj[i] instanceof Array) {
        out[i] = deepCopyArray(obj[i]);
      } else {
        out[i] = deepCopy<Object>(obj[i]);
      }
    } else {
      out[i] = obj[i];
    }
  }
  return <T>out;
}

interface Options {
  filters: Array<{ name: string; extensions: Array<string> }>;
  theme: Record<string, Record<string, string> | string>;
  keybinds: Record<string, string>;
  backup: string;
  filesDir: string;
  recent: Array<string>;
  maxRecent: number;
}

const defaultOptions: Options = {
  filters: [
    { name: "javascript", extensions: ["js"] },
    { name: "json", extensions: ["json"] },
    { name: "markdown", extensions: ["md"] },
    { name: "text", extensions: ["txt"] },
    { name: "all", extensions: ["js", "json", "md", "txt"] },
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
    sketchpad: "ctrl-alt-o",
    format: "ctrl-alt-s",
    quit: "ctrl-q",
    runCode: "ctrl-enter",
    clearConsole: "ctrl-l",
  },
  backup: join(dataDir, "backup.js"),
  filesDir: join(dataDir, "files"),
  recent: [],
  maxRecent: 10,
};

export const options: Options = deepCopy<Options>(defaultOptions);

function matches(a: Object, b: Object): boolean {
  for (let i in b) {
    if (!(i in a)) continue;
    if (typeof b[i] !== typeof a[i]) return false;
    if (b[i] && typeof b[i] === "object") {
      if (!matches(b[i], a[i])) return false;
    }
  }
  return true;
}

function isOptions(obj: Object): obj is Options {
  return matches(obj, defaultOptions);
}

export function reload(): void {
  const newOpts: Options = deepCopy<Options>(defaultOptions);
  try {
    const json = JSON.parse(fs.readFileSync(paths.internal, "utf8"));
    if (typeof json !== "object") throw "not object";
    if (!json) throw "is null";
    Object.assign(newOpts, json);
  } catch {
    fs.writeFileSync(paths.internal, "{}");
  }

  if (!isOptions(options)) throw "invalid options";
  Object.assign(options, newOpts);

  if (!fs.existsSync(options.filesDir)) {
    fs.mkdirSync(options.filesDir, { recursive: true });
  }
}

reload();
