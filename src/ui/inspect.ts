// generates an interactive thing display from (almost) anything in js

import { create, clear } from "../libs/elements";

function select(el: HTMLElement): void {
  const selection = window.getSelection();
  const range = new Range();

  if (selection.rangeCount > 0) {
    selection.removeAllRanges();
  }

  range.selectNode(el);
  selection.addRange(range);
}

// TODO preview first few array items
function displayArray(arr: Array<unknown>): HTMLElement {
  let expanded = false;
  const body = create("div", ["expand", "canExpand"]);
  const cont = create("div", ["array"]);
  function toggle(e): void {
    if (!e.target.classList.contains("expand")) return;
    if (e.target.parentNode !== cont) return;
    if (e.detail > 1 && expanded) {
      select(cont);
      return;
    }
    expanded = !expanded;
    if (expanded) {
      cont.classList.remove("expand");
      clear(cont);
      cont.append(create("div", ["expand"], "["));
      let long = false,
        totalStrLen = 0;
      for (const i in arr) {
        const item = create("div", ["item"]);
        const thing = arr[i];
        item.append(displayPart(thing));
        if (thing) {
          switch (typeof thing) {
            case "object":
              long = true;
              break;
            case "string":
              totalStrLen += thing.length;
              if (totalStrLen > 50) long = true;
              break;
          }
        }
        if (Number(i) !== arr.length - 1)
          item.append(create("div", ["comma"], ","));
        cont.append(item);
      }
      if (arr.length > 10) long = true;
      cont.style.display = long ? "block" : "flex";
      cont.append(create("div", ["expand"], "]"));
    } else {
      cont.classList.add("expand");
      clear(cont);
      cont.append(create("div", ["expand"], "[...]"));
    }
  }
  cont.append(create("div", ["expand"], "[...]"));
  body.append(cont);
  body.addEventListener("click", toggle);
  return body;
}

function displayObject(obj): HTMLElement {
  let expanded = false;
  const name = obj.constructor.name;
  const body = create("div", ["expand", "canExpand"]);
  const cont = create("div", ["object"]);
  function before(): string {
    return name === "Object" ? "" : name + " ";
  }
  function toggle(e): void {
    if (!e.target.classList.contains("expand")) return;
    if (e.target.parentNode !== cont) return;
    if (e.detail > 1 && expanded) {
      select(cont);
      return;
    }
    expanded = !expanded;
    if (expanded) {
      cont.classList.remove("expand");
      clear(cont);
      cont.append(create("div", ["expand"], before() + "{"));
      for (const i in obj) {
        const item = create("div", ["item"]);
        const key = create("div", ["key"], i);
        item.append(key);
        item.append(create("div", ["colon"], ":"));
        item.append(displayPart(obj[i]));
        cont.append(item);
      }
      cont.append(create("div", ["expand"], "}"));
    } else {
      cont.classList.add("expand");
      clear(cont);
      cont.append(create("div", ["expand"], before() + "{...}"));
    }
  }
  cont.append(create("div", ["expand"], before() + "{...}"));
  body.append(cont);
  body.addEventListener("click", toggle);
  return body;
}

// TODO better function display
function displayFunction(func: Function): HTMLElement {
  const str = func.toString();
  const preview = str.length < 35 ? str : str.slice(0, 33) + "...";
  return create("div", ["function"], preview);
}

function displayError(err: Error): HTMLElement {
  const main = err.toString();
  const stack = ""; //err.stack; // problem with vm2
  return create("div", ["error"], main + stack);
}

function displayPart(thing): HTMLElement {
  if (typeof thing === "undefined")
    return create("div", ["value", "undefined"], "undefined");
  switch (typeof thing) {
    case "string":
      // TODO trim string if its too long
      return create("div", ["value", "string"], `"${thing}"`);
      break;
    case "number":
      return create("div", ["value", "number"], thing.toString());
      break;
    case "boolean":
      return create("div", ["value", "boolean"], thing.toString());
      break;
    case "object":
      if (thing === null) return create("div", ["value", "number"], "null");
      if (thing instanceof Array) return displayArray(thing);
      if (thing instanceof Error) return displayError(thing);
      return displayObject(thing);
    case "function":
      return displayFunction(thing);
      break;
    default:
      return create("div", ["value"], thing);
  }
}

export function display(thing): HTMLElement {
  const disp = create("div", ["display"]);
  disp.append(displayPart(thing));
  return disp;
}
