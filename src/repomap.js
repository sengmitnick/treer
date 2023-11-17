import { filenameToLang } from "./language_mapper.js"
import Parser from "tree-sitter"
import fs from "fs"
import path from "path"


class RepoMap {
  constructor(root = null) {
    this.root = root ? root : process.cwd()
  }

  getRankedTags(chatFnames, otherFnames = []) {
    const defines = new Map()
    const references = new Map()
    const definitions = new Map()

    let fnames = new Set([...chatFnames, ...otherFnames])
    const chatRelFnames = new Set()
    fnames = Array.from(fnames).sort()

    for (let fname of fnames) {
      const relFname = this.getRelFname(fname)
      if (chatFnames.includes(fname)) {
        chatRelFnames.add(relFname)
      }

      const tags = this.getTagsRaw(fname, relFname)
      if (!(tags && tags.length)) {
        continue
      }
      for (let tag of tags) {
        if (tag.kind === 'def') {
          if (!defines.get(tag.name)) defines.set(tag.name, new Set())
          defines.get(tag.name).add(relFname)

          const key = [relFname, tag.name]
          if (!definitions.get(key)) definitions.set(key, new Set())
          definitions.get(key).add(tag)
        } else if (tag.kind === 'ref') {
          if (!references.get(tag.name)) references.set(tag.name, [])
          references.get(tag.name).push(relFname)
        }
      }

      console.log("================define===============")
      console.log("================define===============")
      console.log(defines)
      console.log("================references===============")
      console.log("================references===============")
      console.log(references)
      console.log("================definitions===============")
      console.log("================definitions===============")
      console.log(definitions)
    }
  }

  getTagsRaw(fname, relFname) {
    const { Query } = Parser
    const parser = new Parser();
    const [lang, queryScm] = filenameToLang(fname)
    parser.setLanguage(lang);
    const query = new Query(lang, queryScm);
    const sourceCode = fs.readFileSync(fname, 'utf8');
    const tree = parser.parse(sourceCode);
    const tags = []
    for (let match of query.captures(tree.rootNode)) {
      let kind = ''
      if (match.name.startsWith('name.definition.')) kind = 'def'
      else if (match.name.startsWith('name.reference.')) kind = 'ref'

      tags.push({
        relFname: relFname,
        fname: fname,
        name: match.name,
        kind: kind,
        line: match.node.startPosition,
      })
    }
    return tags
  }

  getRelFname(fname) {
    return path.relative(this.root, fname);
  }
}


const repomap = new RepoMap()
repomap.getRankedTags([
  'examples/snake/snake.py',
  'examples/snake/main.py'
])
