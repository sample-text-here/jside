import { NodeVM } from "vm2";
const vm = new NodeVM({ require: null, wrapper: "none" });

export function run(code): unknown {
  try {
    return vm.run(code);
  } catch (err) {
    return err;
  }
}
