import { NodeVM, VM } from "vm2";
const sandbox = {};
const nodevm = new NodeVM({ sandbox, require: null, wrapper: "none" });
const vm = new VM({ sandbox, timeout: 3000 });

export function reset() {
  for (let i in sandbox) {
    delete sandbox[i];
  }
}

export function run(code): unknown {
  try {
    return nodevm.run(code);
  } catch (err) {
    return err;
  }
}

export function runLess(code): unknown {
  try {
    return vm.run(code);
  } catch (err) {
    return err;
  }
}
