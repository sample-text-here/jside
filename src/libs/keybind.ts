export class Bind {
  ctrl = false;
  alt = false;
  shift = false;
  key = "";
  constructor(obj?: {ctrl: boolean, alt: boolean, shift: boolean, key: string,}) {
    if(!obj) return this;
    this.ctrl = obj.ctrl || false;
    this.alt = obj.alt || false;
    this.shift = obj.shift || false;
    this.key = obj.key || "";
  }

  toString(): string {
    let text = "";
    if (this.ctrl) text += "ctrl + ";
    if (this.alt) text += "alt + ";
    if (this.shift) text += "shift + ";
    text += this.key.toLowerCase();
    return text;
  }

  isValid(): boolean {
    const hasControl = this.ctrl || this.alt || this.shift;
    return hasControl && this.key.length > 0;
  }

  isSame(bind: Bind): boolean {
    if (this.key.toLowerCase() !== bind.key.toLowerCase()) return false;
    if (this.ctrl !== bind.ctrl) return false;
    if (this.alt !== bind.alt) return false;
    if (this.shift !== bind.shift) return false;
    return true;
  }

  static fromString(str: string): Bind {
    const bind = new Bind();
    str
      .replace(/\s/g, "")
      .split("+")
      .forEach(i => {
        switch (i) {
          case "ctrl":
          case "alt":
          case "shift":
            bind[i] = true;
            break;
          default:
            bind.key = i;
            break;
        }
      });
    return bind;
  }
}
