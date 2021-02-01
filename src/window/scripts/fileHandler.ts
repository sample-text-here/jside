// TODO: clean up and use this file instead
/*
function postOpen(newPath: string): void {
  queueMicrotask(() => {
    updated = false;
    updateTitle();
  });
  filePath = newPath;
  ext = extname(newPath || ".js").replace(/^\./, "");
  if (newPath) edit.editor.session.setValue(files.openFile(newPath));
  edit.mode(ext);
  if (newPath === paths.config)
    consol.raw("you are editing a config file", "warn");
}

function confirmOpen() {
  if (updated && filePath && !window.confirm("your file isnt saved, continue?"))
    return false;
  return true;
}

function save(): void {
  if (!filePath) filePath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(filePath, edit.editor.session.getValue());
  if (filePath === paths.config) shouldReload.fire();
  if(filePath !== newPath) files.recentFile(newPath);
}

function saveAs(): void {
  const newPath = files.fileSave();
  if (!filePath) return;
  updated = false;
  updateTitle();
  files.saveFile(newPath, edit.editor.session.getValue());
}

function open(): void {
  if (!confirmOpen()) return;
  // reopenIndex--;
  // if (reopenIndex < 0) {
  // reopenIndex = -1;
  // openPath((files.fileOpen() || [])[0], true);
  // return;
  // }
  // const newPath = options.internal.recent[reopenIndex];
  // if (newPath) {
  // files.openFileKeepPath(newPath);
  // postOpen(newPath);
  // clearTimeout(reopenTimeout);
  // reopenTimeout = setTimeout(() => {
  // files.recentFile(newPath);
  // reopenIndex = -1;
  // }, 2000);
  // return;
  // }
  openPath((files.fileOpen() || [])[0], true);
}

function openPath(newPath: string, force = false): void {
  if (!newPath) return;
  if (!force && !confirmOpen()) return;
  postOpen(newPath);
  if(filePath !== newPath) files.recentFile(newPath);
}

// TODO: cyclic open/close
function reopen(): void {
  // reopenIndex++;
  // if (reopenIndex >= options.maxRecent) {
  // reopenIndex = options.maxRecent - 1;
  // }
  // const newPath = options.internal.recent[reopenIndex];
  // if (newPath) {
  // files.openFileKeepPath(newPath);
  // postOpen(newPath);
  // clearTimeout(reopenTimeout);
  // reopenTimeout = setTimeout(() => {
  // reopenIndex = -1;
  // files.recentFile(newPath);
  // }, 2000);
  // }
  const newPath = options.internal.recent[filePath ? 1 : 0];
  if (newPath) openPath(newPath);
}

function openSketch(): void {
  if (!confirmOpen()) return;
  edit.editor.session.setValue(files.loadSketch());
  postOpen(null);
}
*/
