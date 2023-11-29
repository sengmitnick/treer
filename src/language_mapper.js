import path from 'path';
import Python from "tree-sitter-python"

// Updated mapping of file extensions to parsers
const PARSERS = {
  '.py': [Python, `
  (class_definition
    name: (identifier) @name.definition.class) @definition.class
  
  (function_definition
    name: (identifier) @name.definition.function) @definition.function
  
  (call
    function: [
        (identifier) @name.reference.call
        (attribute
          attribute: (identifier) @name.reference.call)
    ]) @reference.call
  `],
  '.js': 'javascript',
  '.go': 'go',
  '.bash': 'bash',
  '.c': 'c',
  '.cc': 'cpp',
  '.cs': 'c_sharp',
  '.cl': 'commonlisp',
  '.cpp': 'cpp',
  '.css': 'css',
  '.dockerfile': 'dockerfile',
  '.dot': 'dot',
  '.el': 'elisp',
  '.ex': 'elixir',
  '.elm': 'elm',
  '.et': 'embedded_template',
  '.erl': 'erlang',
  '.gomod': 'gomod',
  '.hack': 'hack',
  '.hs': 'haskell',
  '.hcl': 'hcl',
  '.html': 'html',
  '.java': 'java',
  '.jsdoc': 'jsdoc',
  '.json': 'json',
  '.jl': 'julia',
  '.kt': 'kotlin',
  '.lua': 'lua',
  '.mk': 'make',
  // '.md': 'markdown', // https://github.com/ikatyang/tree-sitter-markdown/issues/59
  '.m': 'objc',
  '.ml': 'ocaml',
  '.pl': 'perl',
  '.php': 'php',
  '.ql': 'ql',
  '.r': 'r',
  '.R': 'r',
  '.regex': 'regex',
  '.rst': 'rst',
  '.rb': 'ruby',
  '.rs': 'rust',
  '.scala': 'scala',
  '.sql': 'sql',
  '.sqlite': 'sqlite',
  '.toml': 'toml',
  '.tsq': 'tsq',
  '.tsx': 'typescript',
  '.ts': 'typescript',
  '.yaml': 'yaml',
};

export function filenameToLang(filename) {
  const fileExtension = path.extname(filename);
  const lang = PARSERS[fileExtension];
  return lang;
}