interface Autocomplete {
  caption: string;
  value: string;
  meta: string;
}

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
  ],
  boolean: ["true", "false"],
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
  ],
  other: ["Math", "JSON", "isFinite", "isNaN", "parseFloat", "parseInt"],
  null: ["null"],
};

const mapped: Array<Autocomplete> = [];

for (let category in words) {
  for (let word of words[category]) {
    mapped.push({
      caption: word,
      value: word,
      meta: category,
    });
  }
}

// builtin classes
const classes = ["Math", "JSON", ...words.constructor].reduce((acc, i) => {
  acc[i] = [];
  Object.getOwnPropertyNames(globalThis[i]).forEach((j) => {
    acc[i].push({
      caption: j,
      value: j,
      meta: typeof globalThis[i][j] === "function" ? "method" : "property",
      score: 99999,
    });
  });
  return acc;
}, {});

export default {
  getCompletions: function (editor, session, pos, prefix, callback) {
    const line = session.getLine(pos.row).slice(0, pos.column);
    const matched = (line.match(/([a-z0-9_$]+)\.[a-z0-9_$]+$/i) || "")[1];
    if (Object.hasOwnProperty.call(classes, matched)) {
      callback(null, classes[matched]);
    } else if (matched) {
      callback(null, []);
    } else {
      callback(null, mapped);
    }
  },
};
