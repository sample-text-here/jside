// custom autocomplete, see line 12ish in ../ui/editor
interface Autocomplete {
  caption: string;
  value: string;
  meta: string;
}

export const keywords = {
  getCompletions: function (editor, session, pos, prefix, callback) {
    // keywords are in no order, i just put more everytime i could think of one
    // also, i purposefully left out var and undefined
    const words = {
      keyword: [
        "function",
        "if",
        "else",
        "while",
        "for",
        "switch",
        "case",
        "break",
        "default",
        "continue",
        "new",
        "throw",
        "typeof",
        "instanceof",
        "try",
        "catch",
        "finally",
        "return",
        "let",
        "const",
        "return",
        "class",
        "constructor",
        "async",
        "await",
        "in",
        "super",
        "this",
        "Infinity",
        "delete",
        "of",
        "extends",
        "yield",
        "require",
        "console",
      ].sort(),
      boolean: ["true", "false"].sort(),
      constructor: [
        "Number",
        "Boolean",
        "String",
        "Object",
        "Array",
        "Promise",
        "Date",
        "RegExp",
        "Error",
      ].sort(),
      other: [
        "Math",
        "JSON",
        "isFinite",
        "isNaN",
        "parseFloat",
        "parseInt",
      ].sort(),
      null: ["null"],
    };
    const mapped: Array<Autocomplete> = [];

    for (const category in words) {
      for (const word of words[category]) {
        mapped.push({
          caption: word,
          value: word,
          meta: category,
        });
      }
    }
    callback(null, mapped);
  },
};
