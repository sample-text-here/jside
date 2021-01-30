const binds = {};

export class Bind {
  ctrl = false;
  alt = false;
  shift = false;
  private key = "";
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

  toString(): string {
    let text = "";
    if (this.ctrl) text += "ctrl+";
    if (this.alt) text += "alt+";
    if (this.shift) text += "shift+";
    text += this.key;
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
