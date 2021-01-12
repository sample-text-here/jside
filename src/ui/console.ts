import { Element } from "./index";
import { create, clear } from "../libs/elements";
import { display } from "./inspect";
import { Editor } from "./editor";
import { Bar } from "./dragBar";
import { Highlight } from "./highlight";

export class Console extends Element {
  content: HTMLElement;
  bar: Bar;
  input: Editor;
  run: Function;
  constructor(parent: HTMLElement) {
    super();
    const main = create("div", ["console"]);
    const content = create("div");
    const wrap = create("div", ["content"]);
    const input = create("div", ["input"]);
    main.style.gridArea = "console";
    wrap.append(content);
    main.append(wrap);
    const bar = new Bar(main, "upDown");
    main.append(input);
    parent.append(main);
    this.element = main;
    this.content = content;

    this.bar = bar;
    this.input = new Editor(input);
    this.input.editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
      enableLiveAutocompletion: false,
      minLines: 3,
      maxLines: 3,
      showGutter: false,
      highlightActiveLine: false,
    });
    this.input.listen("runCode", "enter", () => {
      const code = this.input.editor.session.getValue();
      new Highlight(content, code);
      if (this.run) this.run(code);
      this.input.editor.session.setValue("");
    });
    bar.dragged = function (e) {
      const barHeight = 3,
        minY = 0,
        maxY = window.innerHeight - barHeight;
      let newY = e.clientY;
      if (newY < minY) newY = minY;
      if (newY > maxY) newY = maxY;
      main.style.gridTemplateRows = `${newY}px ${barHeight}px 1fr`;
      const atEdge = newY === minY || newY === maxY;
      bar.element.style.opacity = String(atEdge ? 0 : 1);
    };
  }

  log(obj): void {
    this.content.append(display(obj));
  }

  clear(): void {
    clear(this.content);
  }
}
