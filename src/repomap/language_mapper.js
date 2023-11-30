const fs = require("fs");
const path = require("path");

const queries = require("./queries.json");

const languages = {
  python: require("tree-sitter-python"),
  javascript: require("tree-sitter-javascript"),
  // go: require("tree-sitter-go"),
  // c: require("tree-sitter-c"),
  // cpp: require("tree-sitter-cpp"),
  // css: require("tree-sitter-css"),
  // html: require("tree-sitter-html"),
  // java: require("tree-sitter-java"),
  // typescript: require("tree-sitter-typescript").typescript,
  // typescriptreact: require("tree-sitter-typescript").tsx,
};

// Updated mapping of file extensions to parsers
const PARSERS = {
  ".py": "python",
  ".jsx": "javascript",
  ".js": "javascript",
  ".go": "go",
  ".bash": "bash",
  ".c": "c",
  ".cc": "cpp",
  ".cs": "c_sharp",
  ".cl": "commonlisp",
  ".cpp": "cpp",
  ".css": "css",
  ".dockerfile": "dockerfile",
  ".dot": "dot",
  ".el": "elisp",
  ".ex": "elixir",
  ".elm": "elm",
  ".et": "embedded_template",
  ".erl": "erlang",
  ".gomod": "gomod",
  ".hack": "hack",
  ".hs": "haskell",
  ".hcl": "hcl",
  ".html": "html",
  ".java": "java",
  ".jsdoc": "jsdoc",
  ".json": "json",
  ".jl": "julia",
  ".kt": "kotlin",
  ".lua": "lua",
  ".mk": "make",
  // '.md': 'markdown', // https://github.com/ikatyang/tree-sitter-markdown/issues/59
  ".m": "objc",
  ".ml": "ocaml",
  ".pl": "perl",
  ".php": "php",
  ".ql": "ql",
  ".r": "r",
  ".R": "r",
  ".regex": "regex",
  ".rst": "rst",
  ".rb": "ruby",
  ".rs": "rust",
  ".scala": "scala",
  ".sql": "sql",
  ".sqlite": "sqlite",
  ".toml": "toml",
  ".tsq": "tsq",
  ".tsx": "typescriptreact",
  ".ts": "typescript",
  ".yaml": "yaml",
};

function filenameToLang(filename) {
  const fileExtension = path.extname(filename);
  const lang = PARSERS[fileExtension];
  if (!lang) return ["txt"];
  const q = queries[`tree-sitter-${lang}-tags`];
  const l = languages[lang];
  if (q && l) {
    return [l, q];
  }
  return ["txt"];
}

exports.filenameToLang = filenameToLang;
