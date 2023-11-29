import { filenameToLang } from "./language_mapper";
const fs = require("fs");
const Parser = require('tree-sitter');
// const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');

const {Query, QueryCursor} = Parser

const parser = new Parser();
parser.setLanguage(Python);

let sourceCode = ''
try {
  const file = './examples/snake/snake.py'
  sourceCode = fs.readFileSync(file, 'utf8');
} catch (err) {
  console.error(err);
}
const tree = parser.parse(sourceCode);

// const matchCode = 'def move(self):'
// const matchTree = parser.parse(matchCode)
// console.log(matchTree.rootNode.)







// console.log(tree.rootNode.namedChildren.map((child) => child))
// console.log("===================================")
// tree.rootNode.namedChildren.forEach((child) => {
//   console.log(child.children.map((sub_child) => sub_child))
// })

// const cursor = tree.walk()
// const nodeTypes = ['identifier', 'function_definition', 'assignment']
// function walkTree(cursor) {
//   if (nodeTypes.includes(cursor.nodeType)) {
//     console.log(cursor.nodeType)
//     console.log(cursor.nodeText)
//   }
//   if (cursor.gotoNextSibling() || cursor.gotoFirstChild()) walkTree(cursor)
// }
// walkTree(cursor)

function formatMatches(tree, matches) {
  return matches.map(({ pattern, captures }) => ({
    pattern,
    captures: formatCaptures(tree, captures),
  }));
}

function formatCaptures(tree, captures) {
  return captures.map((c) => {
    const node = c.node;
    delete c.node;
    // console.log(node)
    c.text = tree.getText(node);
    return c;
  });
}


// const callExpression = tree.rootNode.child(1).firstChild;
// console.log(callExpression);