import { ncp } from "ncp";
import { extname } from "path";

ncp(
  "src", "dist",
  { 
    filter: (name): boolean => extname(name) !== ".ts" 
  }, 
  function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("done!");
  }
);
