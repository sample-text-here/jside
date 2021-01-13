// runs arbitrary code in a sandbox

// TODO share context between vms
import { NodeVM, VM } from "vm2";
let consol;
const sandbox = {};
const vmLibrary: Record<string, NodeVM> = {};
const perms: Record<string, boolean> = {
  fs: false,
};
const vm = new VM({ sandbox, timeout: 3000 });

// TODO permissions

// resets the vm sandbox
export function reset(): void {
  for (let i in sandbox) {
    delete sandbox[i];
  }
}

// run code as a nodejs vm
export function run(code: string): unknown {
  try {
    // TODO make console.log work
    return getVm(permArray()).run(code);
  } catch (err) {
    return err;
  }
}

// run code in a less fancy vm, for the console
export function runLess(code: string): unknown {
  try {
    return vm.run(code);
  } catch (err) {
    return err;
  }
}

// set the console redirect output
export function setConsole(newConsole): void {
  consol = newConsole;
}

// set the node require root
// TODO: fix
// export function setRoot(root: string): void {
//   nodevm.require.root = root;
// }

// sets a permission
export function setPerm(name: string, toggle: boolean): void {
  if (perms.hasOwnProperty(name)) perms[name] = toggle;
}

// convert permission object into an array
function permArray(): Array<string> {
  const arr: Array<string> = [];
  for (const perm in perms) {
    if (perms[perm] === true) arr.push(perm);
  }
  return arr;
}

// because vm2
function getVm(perms: Array<string>) {
  const name: string = perms.sort().join(",");
  if (vmLibrary.hasOwnProperty(name)) return vmLibrary[name];
  const nodevm = new NodeVM({
    sandbox,
    require: {
      external: false,
      builtin: perms,
    },
    wrapper: "none",
    console: "redirect",
  })
    .on("console.log", (msg) => {
      if (consol) consol.log(msg);
    })
    .on("console.info", (msg) => {
      if (consol) consol.log(msg);
    })
    .on("console.warn", (msg) => {
      if (consol) consol.warn(msg);
    })
    .on("console.error", (msg) => {
      if (consol) consol.error(msg);
    });
  vmLibrary[name] = nodevm;
  return nodevm;
}
