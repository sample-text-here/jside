import { Element } from "./index";
import { create } from "../libs/elements";

interface PopupOptions {
  dots: boolean;
  fade: number;
  fadeLen: number;
}

const defaultOpts: PopupOptions = {
  dots: false,
  fade: -1,
  fadeLen: 200,
};

export class Popup extends Element {
  private shown = false;
  private fadeTimeout;
  readonly options: PopupOptions;

  constructor(
    parent: HTMLElement,
    text: string,
    options: Partial<PopupOptions> = {}
  ) {
    super();
    this.options = { ...defaultOpts, ...options };
    const el = create("div", ["popup"], text);
    el.style.display = "none";
    if (this.options.dots) el.classList.add("dots");
    parent.append(el);
    this.element = el;
  }

  fade(duration: number): void {
    clearTimeout(this.fadeTimeout);
    clearInterval(this.fadeTimeout);
    const style = this.element.style;
    style.opacity = "1";
    this.fadeTimeout = setInterval(() => {
      style.opacity = String(Number(style.opacity) - 0.01);
      if (Number(style.opacity) < 0) {
        clearInterval(this.fadeTimeout);
        this.hide();
        style.opacity = "";
      }
    }, duration / 100);
  }

  toggle(): void {
    this.shown = !this.shown;
    if (this.shown) {
      this.show();
    } else {
      this.hide();
    }
  }

  show(): void {
    this.shown = true;
    this.element.style.display = "inline-block";
    if (this.options.fade >= 0) {
      clearTimeout(this.fadeTimeout);
      clearInterval(this.fadeTimeout);
      this.fadeTimeout = setTimeout(() => {
        if (this.options.fadeLen > 0) {
          this.fade(this.options.fadeLen);
        } else {
          this.hide();
        }
      }, this.options.fade);
    }
  }

  hide(): void {
    this.shown = false;
    this.element.style.display = "none";
  }

  text(val?: string): string {
    if (val) {
      this.element.innerText = val;
    }
    return this.element.innerText;
  }
}
