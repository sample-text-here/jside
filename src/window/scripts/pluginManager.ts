// WIP plugins

import { paths } from "../../libs/util";
import { VirtualMachine } from "../../libs/run";
import * as fs from "fs";
import * as path from "path";

export class PluginManager {
  pluginPath = paths.plugins;
  sandbox: Object = {};
  console = null;

  constructor(sandbox = {}, console?) {
    this.sandbox = sandbox;
    this.console = console;
  }

  getPlugins() {
    const dir = fs.opendirSync(this.pluginPath);
    const item = dir.readSync();
    const items = [];
    if (item.isFile() && path.extname(item.name)) items.push(item.name);
    dir.closeSync();
    return items.map((i) => path.join(this.pluginPath, i));
  }

  load() {
    const plugins = this.getPlugins();
    plugins.forEach((i) => {
      const vm = new VirtualMachine(this.sandbox);
      if (this.console) vm.console = this.console;
      const result = vm.run(fs.readFileSync(i, "utf8"), i);
      if (result.err) {
        this.console.error(result.result.toString());
      }
    });
  }

  // TODO: implement unload/reset (if possible?)
  unload() {}
  reset() {}
}
