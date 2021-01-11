import { Element } from "./index";
import { create } from "../libs/elements";

export class Bar extends Element {
  constructor(parent: HTMLElement, direction: string) {
    super();
    const el = create("div", ["bar"]);
    if(direction === "leftRight") {
      el.style.cursor = "ew-resize";
    } else {
      el.style.cursor = "ns-resize";
    }
    parent.append(el);
    this.element = el;
  }
}
