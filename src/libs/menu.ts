// keybinds/menu at the top of the window
import { Menu, MenuItem, BrowserWindow } from "electron";
import { options } from "./options";
import { Bind } from "./keybind";
import { basename } from "path";

function getBind(name: string): string {
  return new Bind(options.keybinds[name]).toString(true);
}

function send(name: string, message: any): void {
  BrowserWindow.getFocusedWindow().webContents.send(name, message);
}

function call(message: string) {
  return () => send("menu", message);
}

function perm(item: MenuItem) {
  // TODO: convert to own event
  // return () => send("perm", {});
  return () => send("menu", item.id + "-" + item.checked);
}

export function generateMenu(dev = false): Menu {
  const recent = [];
  for (const file of options.internal.recent) {
    recent.push(
      new MenuItem({
        label: basename(file),
        click: () => send("openRecent", file),
      })
    );
  }

  const files = new Menu();
  files.append(
    new MenuItem({
      label: "open",
      accelerator: getBind("open"),
      click: call("open"),
    })
  );
  files.append(
    new MenuItem({
      label: "save",
      accelerator: getBind("save"),
      click: call("save"),
    })
  );
  files.append(
    new MenuItem({
      label: "save as",
      accelerator: getBind("saveAs"),
      click: call("saveAs"),
    })
  );
  files.append(
    new MenuItem({
      label: "show file",
      accelerator: getBind("showFile"),
      click: call("showFile"),
    })
  );
  files.append(new MenuItem({ type: "separator" }));
  files.append(
    new MenuItem({
      label: "recent",
      id: "recent",
      type: "submenu",
      submenu: recent,
    })
  );
  files.append(
    new MenuItem({
      label: "reopen file",
      accelerator: getBind("openRecent"),
      click: call("reopen"),
    })
  );
  files.append(
    new MenuItem({
      label: "sketchpad",
      accelerator: getBind("sketchpad"),
      click: call("sketch"),
    })
  );
  files.append(new MenuItem({ type: "separator" }));
  files.append(
    new MenuItem({
      role: "quit",
      label: "quit",
      accelerator: getBind("quit"),
    })
  );

  const perms = new Menu();
  perms.append(
    new MenuItem({
      label: "fs + path",
      id: "perm-fs/path",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "zlib",
      id: "perm-zlib",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "http",
      id: "perm-http",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "https",
      id: "perm-https",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "os",
      id: "perm-os",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "events",
      id: "perm-events",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.append(
    new MenuItem({
      label: "crypto",
      id: "perm-crypto",
      type: "checkbox",
      checked: false,
      click: perm,
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
      accelerator: getBind("format"),
      click: call("format"),
    })
  );

  const code = new Menu();
  code.append(
    new MenuItem({
      label: "run",
      accelerator: getBind("run"),
      click: call("run"),
    })
  );
  code.append(
    new MenuItem({
      label: "clear console",
      accelerator: getBind("clear"),
      click: call("clear"),
    })
  );

  const menu = new Menu();
  menu.append(new MenuItem({ label: "file", type: "submenu", submenu: files }));
  menu.append(new MenuItem({ label: "edit", type: "submenu", submenu: edit }));
  menu.append(
    new MenuItem({ label: "perms", type: "submenu", submenu: perms })
  );
  menu.append(new MenuItem({ label: "code", type: "submenu", submenu: code }));
  if (dev) menu.append(new MenuItem({ role: "viewMenu" }));
  return menu;
}
