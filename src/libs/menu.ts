// keybinds/menu at the top of the window
import { Menu, MenuItem, BrowserWindow } from "electron";

export function generateMenu(win: BrowserWindow): Menu {
  function call(message: string): void {
    win.webContents.send("menu", message);
  }

  const files = [];
  files.push(
    new MenuItem({
      label: "open",
      accelerator: "CommandOrControl+o",
      click(): void {
        call("open");
      },
    })
  );
  files.push(
    new MenuItem({
      label: "save",
      accelerator: "CommandOrControl+s",
      click(): void {
        call("save");
      },
    })
  );
  files.push(
    new MenuItem({
      label: "save as",
      accelerator: "CommandOrControl+shift+s",
      click(): void {
        call("saveAs");
      },
    })
  );
  files.push(new MenuItem({ type: "separator" }));
  files.push(
    new MenuItem({
      label: "recent",
      id: "recent",
      type: "submenu",
      submenu: [],
    })
  );
  files.push(
    new MenuItem({
      label: "reopen file",
      accelerator: "CommandOrControl+shift+o",
      click(): void {
        call("reopen");
      },
    })
  );
  files.push(
    new MenuItem({
      label: "sketchpad",
      accelerator: "CommandOrControl+alt+o",
      click(): void {
        call("sketch");
      },
    })
  );
  files.push(new MenuItem({ type: "separator" }));
  files.push(
    new MenuItem({
      role: "quit",
      label: "quit",
      accelerator: "CommandOrControl+q",
    })
  );

  const perms = [];
  function perm(item): void {
    call(`perm-${item.id.split("-")[1]}-${item.checked ? "on" : "off"}`);
  }
  perms.push(
    new MenuItem({
      label: "fs + path",
      id: "perm-fs/path",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "zlib",
      id: "perm-zlib",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "http",
      id: "perm-http",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "https",
      id: "perm-https",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "os",
      id: "perm-os",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "events",
      id: "perm-events",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );
  perms.push(
    new MenuItem({
      label: "crypto",
      id: "perm-crypto",
      type: "checkbox",
      checked: false,
      click: perm,
    })
  );

  const edit = [];
  edit.push(new MenuItem({ label: "undo", role: "undo" }));
  edit.push(new MenuItem({ label: "redo", role: "redo" }));
  edit.push(new MenuItem({ type: "separator" }));
  edit.push(new MenuItem({ label: "cut", role: "cut" }));
  edit.push(new MenuItem({ label: "copy", role: "copy" }));
  edit.push(new MenuItem({ label: "paste", role: "paste" }));
  edit.push(new MenuItem({ label: "delete", role: "delete" }));
  edit.push(new MenuItem({ type: "separator" }));
  edit.push(
    new MenuItem({
      label: "format code",
      accelerator: "CommandOrControl+alt+s",
      click(): void {
        call("format");
      },
    })
  );

  const code = [];
  code.push(
    new MenuItem({
      label: "run",
      accelerator: "CommandOrControl+enter",
      click(): void {
        call("run");
      },
    })
  );
  code.push(
    new MenuItem({
      label: "clear console",
      accelerator: "CommandOrControl+l",
      click(): void {
        call("clear");
      },
    })
  );

  const menu = new Menu();
  menu.append(new MenuItem({ label: "file", type: "submenu", submenu: files }));
  menu.append(new MenuItem({ label: "edit", type: "submenu", submenu: edit }));
  menu.append(
    new MenuItem({ label: "permissions", type: "submenu", submenu: perms })
  );
  menu.append(new MenuItem({ label: "code", type: "submenu", submenu: code }));
  if (process.argv.includes("--dev"))
    menu.append(new MenuItem({ role: "viewMenu" }));
  return menu;
}
