// this is your config file
// it has all the options available
// if you don't specify an option, it will just use the default

module.exports = {
  theme: {
    isDark: "true", // is it a dark theme
    // the main theme
    main: {
      foreground: "",
      background: "#272822",
      accent: "",
      selection: "",
    },
    // the editor
    editor: {
      gutter: "",
      currentLine: "#272727",
    },
    // syntax highlighting
    highlight: {
      comment: "",
      keyword: "",
      number: "",
      string: "",
      parenthase: "",
    },
  },
  keybinds: {
    sketchpad: "ctrl-alt-o",
    format: "ctrl-alt-s",
    quit: "ctrl-q",
    runCode: "ctrl-enter",
    clearConsole: "ctrl-l",
  },
};
