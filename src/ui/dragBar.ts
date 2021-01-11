import { Element } from "./index";
import { create } from "../libs/elements";

let bars = [];
let target = null;

document.addEventListener("mousedown", (event) => {
  target = null;
  const filtered = bars.filter((i) => i.element.contains(event.target));
  if (filtered.length === 0) return;
  if (!filtered[0].hasOwnProperty("dragged")) return;
  target = filtered[0];
  target.dragged(event);
});

document.addEventListener("mousemove", (event) => {
  if (!target) return;
  target.dragged(event);
});

document.addEventListener("mouseup", (event) => {
  if (!target) return;
  target.dragged(event);
  target = null;
});

export class Bar extends Element {
  dragged: Function;
  constructor(parent: HTMLElement, direction: string) {
    super();
    const el = create("div", ["bar"]);
    if (direction === "leftRight") {
      el.style.cursor = "ew-resize";
    } else {
      el.style.cursor = "ns-resize";
    }
    parent.append(el);
    bars.push(this);
    this.element = el;
  }

  dispose() {
    super.dispose();
    bars = bars.filter((i) => i !== this);
    return null;
  }
}
