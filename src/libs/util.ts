// various functions that don't fit anywhere else
import * as fs from "fs";
import * as path from "path";
import { app as _app, remote } from "electron";
export const app = _app || remote.app;

// setup data paths

const dataDir = app.getPath("userData");
export const paths = {
  data: dataDir,
  plugins: path.join(dataDir, "plugins"),
  internal: path.join(dataDir, "internal.json"),
  sketch: path.join(dataDir, "sketch.js"),
  config: path.join(dataDir, "config.js"),
};

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(paths.plugins)) fs.mkdirSync(paths.plugins);
if (!fs.existsSync(paths.sketch)) fs.writeFileSync(paths.sketch, "");
if (!fs.existsSync(paths.internal)) fs.writeFileSync(paths.internal, "{}");
if (!fs.existsSync(paths.config)) {
  fs.writeFileSync(paths.config, "// config goes here\n\nmodule.exports = {}");
}

// object utility functions

export function deepCopyArray(arr: Array<any>) {
  const out: Array<any> = [];
  for (const i of arr) {
    if (i && typeof i === "object") {
      if (i instanceof Array) {
        out.push(deepCopyArray(i));
      } else {
        out.push(deepCopy(i));
      }
    } else {
      out.push(i);
    }
  }
  return out;
}

export function deepCopy<T = Record<string, any>>(obj: Record<string, any>): T {
  const out = {};
  for (const i in obj) {
    if (obj[i] && typeof obj[i] === "object") {
      if (obj[i] instanceof Array) {
        out[i] = deepCopyArray(obj[i]);
      } else {
        out[i] = deepCopy(obj[i]);
      }
    } else {
      out[i] = obj[i];
    }
  }
  return out as T;
}

export function matches(
  a: Record<string, any>,
  b: Record<string, any>
): boolean {
  for (const i in b) {
    if (!(i in a)) continue;
    if (typeof b[i] !== typeof a[i]) return false;
    if (b[i] && typeof b[i] === "object") {
      if (!matches(b[i], a[i])) return false;
    }
  }
  return true;
}

export function assign(a: Record<string, any>, b: Record<string, any>): void {
  for (const i in b) {
    if (
      i in a &&
      a[i] &&
      typeof a[i] === "object" &&
      b[i] &&
      typeof b[i] === "object"
    ) {
      assign(a[i], b[i]);
    } else {
      a[i] = b[i];
    }
  }
}

// parse args

class Args {
  file: string = "";
  flags: Array<string> = [];

  constructor(args) {
    for (const i of args) {
      if (/^--/.test(i)) {
        this.flags.push(i.substr(2));
      } else if (fs.existsSync(i)) {
        this.file = i;
      }
    }
  }

  has(arg: string) {
    return this.flags.includes(arg);
  }
}

export const args = new Args(
  (process.type === "renderer" ? remote.process : process).argv.slice(
    app.isPackaged ? 1 : 2
  )
);

// file types

interface FileType {
  name: string;
  exts: Array<string>;
  parse?: string;
  autocomplete: boolean;
  sidePanel: "console" | "preview" | "none";
}

export const fileTypes: Array<FileType> = [
  {
    name: "javascript",
    exts: ["js"],
    parse: "babel",
    autocomplete: true,
    sidePanel: "console",
  },
  {
    name: "typescript",
    exts: ["ts"],
    parse: "babel-typescript",
    autocomplete: true,
    sidePanel: "console",
  },
  {
    name: "json",
    exts: ["json"],
    parse: "json",
    autocomplete: true,
    sidePanel: "console",
  },
  {
    name: "markdown",
    exts: ["md"],
    parse: "markdown",
    autocomplete: false,
    sidePanel: "preview",
  },
  {
    name: "mindustry logic",
    exts: ["mlog"],
    autocomplete: true,
    sidePanel: "none",
  },
  {
    name: "text",
    exts: ["txt"],
    autocomplete: false,
    sidePanel: "none",
  },
];
