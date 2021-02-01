// runs arbitrary code in a sandbox

// TODO share context between vms
import { NodeVM, VM, VMScript } from "vm2";
let consol;
const sandbox = {};
const vm = new VM({ sandbox, timeout: 3000 });
const nodevm = new NodeVM({
  sandbox,
  require: {
    external: false,
    builtin: ["*"],
  },
  wrapper: "none",
  console: "redirect",
})
  .on("console.log", (...msg) => {
    if (consol) msg.forEach((i) => consol.log(i));
  })
  .on("console.info", (...msg) => {
    if (consol) msg.forEach((i) => consol.log(i));
  })
  .on("console.warn", (...msg) => {
    if (consol) msg.forEach((i) => consol.warn(i));
  })
  .on("console.error", (...msg) => {
    if (consol) msg.forEach((i) => consol.error(i));
  });

// resets the vm sandbox
export function reset(): void {
  for (const i in sandbox) {
    delete sandbox[i];
  }
}

interface VMResult {
  value: unknown;
  err: boolean;
}

// run code as a nodejs vm
export function run(code: string, fileName = "something.js"): VMResult {
  try {
    return {
      value: nodevm.run(new VMScript(code, fileName)),
      err: false,
    };
  } catch (err) {
    return { value: err, err: true };
  }
}

// run code in a less fancy vm, for the console
export function runLess(code: string): VMResult {
  try {
    return {
      value: vm.run(code),
      err: false,
    };
  } catch (err) {
    return { value: err, err: true };
  }
}

// set the console redirect output
export function setConsole(newConsole): void {
  consol = newConsole;
}

// set the node require root
// TODO: fix (require root)
// export function setRoot(root: string): void {
//   nodevm.require.root = root;
// }
