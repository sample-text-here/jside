// WIP plugins

import { paths } from "../../libs/util";
import * as fs from "fs";
import { extname } from "path";

export class PluginManager {
  pluginPath = paths.plugins;

  constructor() {}

  getPlugins() {
    const dir = fs.opendirSync(this.pluginPath);
    const item = dir.readSync();
    if (item.isFile() && extname(item.name)) {
    }
    dir.closeSync();
  }

  load() {}

  unload() {}

  reset() {}
}
