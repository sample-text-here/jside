// runs arbitrary code in a sandbox

// TODO share context between vms
import { NodeVM, VM, VMScript } from "vm2";
import { Console } from "../ui/console";
const defaultVM = new VM({ timeout: 3000 });

interface VMResult {
  result: unknown;
  err: boolean;
}

export function run(code: string): VMResult {
  try {
    return {
      result: defaultVM.run(code),
      err: false,
    };
  } catch (err) {
    return { result: err, err: true };
  }
}

export class VirtualMachine {
  vm: NodeVM;
  console: Console;
  sandbox: Record<string, any> = {};

  constructor() {
    const me = this;
    me.vm = new NodeVM({
      sandbox: me.sandbox,
      require: {
        external: false,
        builtin: ["*"],
      },
      console: "redirect",
    })
      .on("console.log", (...msg) => {
        me.appendConsole("log", msg);
      })
      .on("console.info", (...msg) => {
        me.appendConsole("log", msg);
      })
      .on("console.warn", (...msg) => {
        me.appendConsole("warn", msg);
      })
      .on("console.error", (...msg) => {
        me.appendConsole("error", msg);
      });
  }

  run(code: string, fileName = "unknown"): VMResult {
    this.reset();
    try {
      const script = new VMScript(code, fileName);
      const result = this.vm.run(script);
      return {
        result,
        err: false,
      };
    } catch (err) {
      return { result: err, err: true };
    }
  }

  reset(): void {
    for (const i in this.sandbox) {
      delete this.sandbox[i];
    }
  }

  appendConsole(kind: string, msg: Array<any>): void {
    if (this.console) msg.forEach((i) => this.console[kind](i));
  }
}

// set the node require root
// TODO: fix (require root)
// export function setRoot(root: string): void {
//   nodevm.require.root = root;
// }
