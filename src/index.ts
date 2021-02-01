import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  MenuItem,
  shell,
  dialog,
} from "electron";
import * as fs from "fs";
import * as path from "path";
import { generateMenu } from "./libs/menu";
import { parse } from "./libs/args";
import { paths, options, reload } from "./libs/options";
import { Bind } from "./libs/keybind";
import event from "./libs/events";
const args = parse();
const allowed = ["js", "json", "md", "txt", "mlog"];
const keys = [];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

function regenMenu(): void {
  const menu = generateMenu(args.options.includes("dev"));
  menu.append(
    new MenuItem({
      label: "help",
      role: "help",
      click: (): void => showHelp(),
    })
  );

  Menu.setApplicationMenu(menu);

  while (keys.length > 0) keys.pop();

  for (let category in options.keybinds) {
    const binds = options.keybinds[category];
    for (let bind in binds) {
      if (!["run", "clear", "format", "showFile"].includes(bind)) continue;
      keys.push({ bind: new Bind(binds[bind]), message: bind });
    }
  }
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    height: 400,
    width: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    show: false,
  });

  // and load the index.html of the app.
  win.loadFile(path.join(__dirname, "window/index.html"));

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.on("before-input-event", (e, input) => {
    const press = new Bind(input.key.toLowerCase());
    press.ctrl = input.control || input.meta;
    press.shift = input.shift;
    press.alt = input.alt;
    if (!press.isValid()) return;
    for (const i of keys) {
      if (press.isSame(i.bind)) {
        e.preventDefault();

        win.webContents.send("menu", i.message);
        break;
      }
    }
  });

  return win;
}

function showHelp(): void {
  const help = new BrowserWindow({
    height: 350,
    width: 350,
    show: false,
  });

  help.loadFile(path.join(__dirname, "window/help.html"));
  help.setMenu(null);

  help.once("ready-to-show", () => {
    help.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  const win = createWindow();
  win.once("ready-to-show", () => {
    if (args.file) {
      // (ab)use openRecent
      win.webContents.send("openRecent", args.file);
    }
  });
  regenMenu();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// TODO: only reload needed parts
// seperate event for a full reload
const reloadEv = event("reload");
function reloadAll(): void {
  reloadEv.fire();
  reload();
  regenMenu();
}

fs.watchFile(paths.config, reloadAll);
event("shouldReload").addListener(reloadAll);
event("showFile").addListener((file) => shell.showItemInFolder(file[0]));
