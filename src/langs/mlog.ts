import * as ace from "ace-builds/src-noconflict/ace";
interface Autocomplete {
  caption: string;
  value: string;
  meta: string;
}

const keywords = {
  boolean: ["true", "false"],
  null: ["null"],
};

const mapped: Array<Autocomplete> = [];

for (let category in keywords) {
  for (let word of keywords[category]) {
    mapped.push({
      caption: word,
      value: word,
      meta: category,
    });
  }
}

const builtin: Array<Autocomplete> = [
  "scrap",
  "copper",
  "lead",
  "graphite",
  "coal",
  "titanium",
  "thorium",
  "silicon",
  "plastanium",
  "phase-fabric",
  "surge-alloy",
  "spore-pod",
  "sand",
  "blast-compound",
  "pyratite",
  "metaglass",
  "water",
  "oil",
  "slag",
  "cryofluid",
].map(
  (i) =>
    ({
      caption: "@" + i,
      value: i,
      meta: "builtin",
      score: 1000,
    } as Autocomplete)
);

export default {
  getCompletions: function (editor, session, pos, prefix, callback) {
    const match = session
      .getLine(pos.row)
      .slice(0, pos.column)
      .match(/@[a-z0-9-]+$/i);
    if (match) {
      callback(null, builtin);
    } else {
      callback(null, mapped);
    }
  },
};

// define mlog language
ace.define("ace/mode/mindustry-logic", function (require, exports, module) {
  const oop = require("ace/lib/oop");
  const TextMode = require("ace/mode/text").Mode;
  const { hlRules } = require("ace/mode/mindustry-logic_highlight_rules");

  const Mode = function () {
    this.HighlightRules = hlRules;
  };
  oop.inherits(Mode, TextMode);

  exports.Mode = Mode;
});

ace.define(
  "ace/mode/mindustry-logic_highlight_rules",
  function (require, exports, module) {
    const oop = require("ace/lib/oop");
    const { TextHighlightRules } = require("ace/mode/text_highlight_rules");
    const hlRules = function () {
      this.$rules = {
        start: [
          {
            token: "comment",
            regex: "#.*",
          },
          {
            token: "keyword",
            regex: "^[a-z]+",
            next: "line",
          },
          {
            defaultToken: "text",
          },
        ],
        line: [
          {
            token: "text",
            regex: "$",
            next: "start",
          },
          {
            token: "comment",
            regex: "#.*",
          },
          {
            token: "constant.numeric",
            regex: "(0[xb])?[0-9]+",
          },
          {
            token: "constant.string",
            regex: '"',
            next: "string",
          },
          {
            token: "constant.language",
            regex: "@[a-z0-9-]+",
          },
          {
            token: "text",
            regex: "[a-z_][a-z0-9_]+",
          },
          {
            defaultToken: "text",
          },
        ],
        string: [
          {
            token: "constant.language.escape",
            regex: /\\./,
          },
          {
            token: "string",
            regex: '"|$',
            next: "start",
          },
          {
            defaultToken: "string",
          },
        ],
      };
    };

    oop.inherits(hlRules, TextHighlightRules);

    exports.hlRules = hlRules;
  }
);
