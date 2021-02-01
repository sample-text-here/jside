// keybinds/menu at the top of the window
import { Menu, MenuItem, BrowserWindow } from "electron";
import { options } from "./options";
import { Bind } from "./keybind";
import { basename } from "path";

function getBind(category: string, name: string): string {
  return new Bind(options.keybinds[category][name]).toString(true);
}

function send(name: string, message: any): void {
  BrowserWindow.getFocusedWindow().webContents.send(name, message);
}

function call(message: string) {
  return () => send("menu", message);
}

function generateRecents(fileNames: Array<string>): Menu {
  const recents = new Menu();
  for (const file of fileNames) {
    recents.append(
      new MenuItem({
        label: basename(file),
        click: () => send("openRecent", file),
      })
    );
  }
  return recents;
}

export function generateMenu(dev = false): Menu {
  const files = new Menu();
  files.append(
    new MenuItem({
      label: "open",
      accelerator: getBind("files", "open"),
      click: call("open"),
    })
  );
  files.append(
    new MenuItem({
      label: "save",
      accelerator: getBind("files", "save"),
      click: call("save"),
    })
  );
  files.append(
    new MenuItem({
      label: "save as",
      accelerator: getBind("files", "saveAs"),
      click: call("saveAs"),
    })
  );
  files.append(
    new MenuItem({
      label: "show file",
      accelerator: getBind("files", "showFile"),
      click: call("showFile"),
    })
  );
  files.append(new MenuItem({ type: "separator" }));
  files.append(
    new MenuItem({
      label: "recent",
      id: "recent",
      type: "submenu",
      submenu: generateRecents(options.internal.recent),
    })
  );
  files.append(
    new MenuItem({
      label: "reopen file",
      accelerator: getBind("files", "openRecent"),
      click: call("reopen"),
    })
  );
  files.append(
    new MenuItem({
      label: "sketchpad",
      accelerator: getBind("files", "sketchpad"),
      click: call("sketch"),
    })
  );
  files.append(new MenuItem({ type: "separator" }));
  files.append(
    new MenuItem({
      role: "quit",
      label: "quit",
      accelerator: getBind("files", "quit"),
    })
  );

  const edit = new Menu();
  edit.append(new MenuItem({ label: "undo", role: "undo" }));
  edit.append(new MenuItem({ label: "redo", role: "redo" }));
  edit.append(new MenuItem({ type: "separator" }));
  edit.append(new MenuItem({ label: "cut", role: "cut" }));
  edit.append(new MenuItem({ label: "copy", role: "copy" }));
  edit.append(new MenuItem({ label: "paste", role: "paste" }));
  edit.append(new MenuItem({ label: "delete", role: "delete" }));
  edit.append(new MenuItem({ type: "separator" }));
  edit.append(
    new MenuItem({
      label: "format code",
      accelerator: getBind("code", "format"),
      click: call("format"),
    })
  );

  const code = new Menu();
  code.append(
    new MenuItem({
      label: "run",
      accelerator: getBind("code", "run"),
      click: call("run"),
    })
  );
  code.append(
    new MenuItem({
      label: "clear console",
      accelerator: getBind("code", "clear"),
      click: call("clear"),
    })
  );

  const menu = new Menu();
  menu.append(new MenuItem({ label: "file", type: "submenu", submenu: files }));
  menu.append(new MenuItem({ label: "edit", type: "submenu", submenu: edit }));
  menu.append(new MenuItem({ label: "code", type: "submenu", submenu: code }));
  if (dev) menu.append(new MenuItem({ role: "viewMenu" }));
  return menu;
}
