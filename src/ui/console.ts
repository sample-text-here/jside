// creates a console

import { Element } from "./index";
import { create, clear } from "../libs/elements";
import { display } from "./inspect";
import { Editor } from "./editor";
import { Bar } from "./dragBar";
import { Highlight } from "./highlight";

function gotoEnd(editor) {
  const row = editor.session.getLength() - 1;
  const column = Infinity;
  editor.selection.moveTo(row + 1, column);
}

function queueScroll(el): void {
  const atBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 1;
  queueMicrotask(() => {
    window.requestAnimationFrame(() => {
      if (atBottom) {
        el.scrollTo({
          left: 0,
          top: 1e10,
          behavior: "smooth",
        });
      }
    });
  });
}

export class Console extends Element {
  content: HTMLElement;
  bar: Bar;
  input: Editor;
  run: Function;
  constructor(parent: HTMLElement) {
    super();
    const main = create("div", ["console"]);
    const content = create("div", ["content"]);
    const input = create("div", ["input"]);
    main.style.gridArea = "console";
    main.append(content);
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
      minLines: 2,
      maxLines: 3,
      showGutter: false,
      highlightActiveLine: false,
    });

    const history: Array<string> = [];
    let histIndex: number = -1;
    let currentCode: string = "";
    this.input.listen("runCode", "enter", () => {
      // TODO console icons, see more below
      // need icon for console input, console
      // output, and code ran from editor
      // also a icon in front of console editor

      queueScroll(content);

      const code = this.input.editor.session.getValue();

      new Highlight(content, code);
      if (this.run) this.run(code);
      if (code !== history[0] && code.length > 0) history.unshift(code);
      histIndex = -1;
      this.input.editor.session.setValue("");
      currentCode = "";
    });

    this.input.listen("prevHist", "up", () => {
      if (histIndex === -1) currentCode = this.input.editor.session.getValue();
      histIndex++;
      if (histIndex >= history.length) histIndex = history.length - 1;
      if (history.length > 0) {
        this.input.editor.session.setValue(history[histIndex]);
      }
      gotoEnd(this.input.editor);
    });

    this.input.listen("nextHist", "down", () => {
      histIndex--;
      if (histIndex < -1) histIndex = -1;
      if (histIndex >= 0 && history.length > 0) {
        this.input.editor.session.setValue(history[histIndex]);
      } else {
        this.input.editor.session.setValue(currentCode);
      }
      gotoEnd(this.input.editor);
    });

    bar.dragged = (e) => {
      const barHeight = 3,
        minY = barHeight,
        maxY = window.innerHeight - 3;
      let newY = e.clientY;
      if (newY < minY) newY = minY;
      if (newY > maxY) newY = maxY;
      main.style.gridTemplateRows = `${newY}px ${barHeight}px 1fr`;
      const atEdge = newY === minY || newY === maxY;
      bar.element.style.opacity = String(atEdge ? 0 : 1);
      this.resize();
    };
  }

  log(obj): void {
    queueScroll(this.content);
    const disp = display(obj);
    this.content.append(disp);
  }

  warn(obj): void {
    queueScroll(this.content);
    const disp = display(obj);
    disp.classList.add("warn");
    this.content.append(disp);
  }

  error(obj): void {
    queueScroll(this.content);
    const disp = display(obj);
    disp.classList.add("error");
    this.content.append(disp);
  }

  resize(): void {
    this.input.editor.resize();
  }

  clear(): void {
    clear(this.content);
  }
}
