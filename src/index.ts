import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  MenuItem,
  shell,
  dialog,
  Notification,
} from "electron";
import * as fs from "fs";
import * as path from "path";
import { generateMenu, generateRecents } from "./libs/menu";
import { paths, args } from "./libs/util";
import { options, reload } from "./libs/options";
import { Bind } from "./libs/keybind";
import event from "./libs/events";
const keys = [];

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) app.quit();

function regenMenu(): void {
  const menu = generateMenu(args.has("dev"));
  menu.append(
    new MenuItem({
      label: "help",
      click: (): void => {
        createWindow("help.html").setMenu(null);
      },
    })
  );

  Menu.setApplicationMenu(menu);

  while (keys.length > 0) keys.pop();

  const binds = options.keybinds;
  const override = { ...binds.files, ...binds.code };
  for (const bind in override) {
    keys.push({ bind: new Bind(override[bind]), message: bind });
  }

  if (!new Bind(binds.files.config).isValid()) {
    new Notification({
      title: "achievement unlocked",
      body: "why did you do that",
    }).show();
  }
}

function createWindow(file: string, options = {}): BrowserWindow {
  const win = new BrowserWindow({
    height: 350,
    width: 350,
    show: false,
    // TODO: make an icon that doesn't make my eyes bleed
    // icon: path.join(__dirname, "assets", "icon.png"),
    ...options,
  });

  win.loadFile(path.join(__dirname, "window", file));

  win.once("ready-to-show", () => {
    win.show();
  });

  return win;
}

function createSession(): BrowserWindow {
  const win = createWindow("index.html", {
    height: 400,
    width: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.webContents.on("before-input-event", (e, input) => {
    const press = new Bind(input.key.toLowerCase());
    press.ctrl = process.platform === "darwin" ? input.meta : input.control;
    press.shift = input.shift;
    press.alt = input.alt;
    if (!press.isValid()) return;
    for (const i of keys) {
      if (press.isSame(i.bind)) {
        e.preventDefault();
        switch (i.message) {
          case "quit":
            win.close();
            return;
          case "new":
            createSession();
            return;
          default:
            win.webContents.send("menu", i.message);
        }
        return;
      }
    }
  });

  return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  reloadRecent();
  const win = createSession();
  win.once("ready-to-show", () => {
    if (args.file) {
      win.webContents.send("openRecent", args.file);
    }
  });
});

app.on("window-all-closed", app.quit);

// TODO: only reload needed parts
// seperate event for a full reload
const reloadEv = event("reload", true);
const finishEv = event("reload.finish", true);
function reloadAll(): void {
  reloadEv.fire();
  reload();
  regenMenu();
  finishEv.fire();
}

function reloadRecent(): void {
  reload();
  regenMenu();
  finishEv.fire();
}

fs.watchFile(paths.config, reloadAll);
event("reload.force", true).addListener(reloadAll);
event("reload.recent", true).addListener(reloadRecent);
event("showFile", true).addListener((file) => shell.showItemInFolder(file));
