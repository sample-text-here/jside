import { Element } from "./index";
import { create } from "../libs/elements";

interface PopupOptions {
  dots: boolean;
  fade: number;
  fadeLen: number;
}

const defaultOpts = {
  dots: false,
  fade: -1,
  fadeLen: 200,
};

export class Popup extends Element {
  shown = false;

  constructor(
    parent: HTMLElement,
    text: string,
    options: Partial<PopupOptions> = {}
  ) {
    super();
    options = { ...defaultOpts, ...options };
    const el = create("div", ["popup"], text);
    if (options.dots) el.classList.add("dots");
    parent.append(el);
    this.element = el;
    if (options.fade >= 0) {
      setTimeout(() => {
        if (options.fadeLen > 0) {
          this.fade(options.fadeLen);
        } else {
          this.dispose();
        }
      }, options.fade);
    }
  }

  fade(duration: number): void {
    const style = this.element.style;
    style.opacity = "1";
    const fade = setInterval(() => {
      style.opacity = String(Number(style.opacity) - 0.01);
      if (Number(style.opacity) < 0) {
        clearInterval(fade);
        this.dispose();
      }
    }, duration / 100);
  }

  toggle(): void {
    this.shown = !this.shown;
    this.element.style.display = this.shown ? "inline-block" : "none";
  }
}
