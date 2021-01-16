// save and load options
import { join } from "path";
import * as fs from "fs";
import { app } from "electron";
export const dataDir = app.getPath("userData");
export const configPath = join(dataDir, "config.js");
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    fs.readFileSync(join("assets", "default.js"), "utf8")
  );
}
