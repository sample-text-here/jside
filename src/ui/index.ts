export class Element {
  element: HTMLElement;

  dispose(): void {
    this.element.remove();
    this.element = null;
    return null;
  }
}
