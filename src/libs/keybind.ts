const binds = {};

export class Bind {
  ctrl = false;
  alt = false;
  shift = false;
  private _key = "";
  constructor(str: string) {
    str
      .toLowerCase()
      .replace(/\s/g, "")
      .split(/[\-+]/g)
      .forEach((i) => {
        switch (i) {
          case "cmd":
            i = "ctrl";
          case "ctrl":
          case "alt":
          case "shift":
            this[i] = true;
            break;
          default:
            this.key = i;
            break;
        }
      });
  }

  get key() {
    return this._key;
  }

  set key(key: string) {
    this._key = key.toLowerCase();
  }

  toString(electron = false): string {
    let text = "";
    if (this.ctrl) text += electron ? "CmdOrCtrl+" : "ctrl-";
    if (this.alt) text += electron ? "Alt+" : "alt-";
    if (this.shift) text += electron ? "Shift+" : "shift-";
    text += electron
      ? this.key.charAt(0).toUpperCase() + this.key.slice(1)
      : this.key;
    return text;
  }

  isValid(): boolean {
    const hasControl = this.ctrl || this.alt || this.shift;
    return hasControl && this.key.length > 0;
  }

  isSame(bind: Bind): boolean {
    if (this.key !== bind.key) return false;
    if (this.ctrl !== bind.ctrl) return false;
    if (this.alt !== bind.alt) return false;
    if (this.shift !== bind.shift) return false;
    return true;
  }
}
