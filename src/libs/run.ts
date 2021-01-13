// runs arbitrary code in a sandbox

// TODO share context between vms
import { NodeVM, VM, NodeVMOptions, VMScript } from "vm2";
let consol;
const sandbox = {};
const vmLibrary: Record<string, NodeVM> = {};
const perms: Record<string, boolean> = {
  fs: false,
  path: false,
  zlib: false,
  http: false,
  https: false,
  os: false,
};
const vm = new VM({ sandbox, timeout: 3000 });

// resets the vm sandbox
export function reset(): void {
  for (let i in sandbox) {
    delete sandbox[i];
  }
}

interface VMResult {
  value: unknown;
  err: boolean;
}

// run code as a nodejs vm
export function run(code: string, fileName: string = "yourCode.js"): VMResult {
  try {
    return {
      value: getVm(permArray()).run(new VMScript(code, fileName)),
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

// sets a permission
export function setPerm(name: string, toggle: boolean): void {
  name.split("/").forEach((i) => {
    if (perms.hasOwnProperty(i)) perms[i] = toggle;
  });
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
function getVm(perms: Array<string>, obj: object = {}) {
  const options = Object.assign(
    {
      sandbox,
      require: {
        external: false,
        builtin: perms,
      },
      wrapper: "none",
      console: "redirect",
    },
    obj
  ) as NodeVMOptions;

  // lazy way of getting a unique name
  const name: string = perms.sort().join(",") + JSON.stringify(obj);
  if (vmLibrary.hasOwnProperty(name)) return vmLibrary[name];

  const nodevm = new NodeVM(options)
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
  vmLibrary[name] = nodevm;
  return nodevm;
}
