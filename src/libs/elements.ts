// element handling functions
// not in util.ts because these require `document`

export function create(
  type: string,
  classes?: Array<string>,
  text?: string
): HTMLElement {
  const el = document.createElement(type);
  if (classes) classes.forEach((i) => el.classList.add(i));
  if (text) {
    const node = document.createTextNode(text);
    el.append(node);
  }
  return el;
}

export function clear(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}
