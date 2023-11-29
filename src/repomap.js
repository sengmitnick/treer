import { filenameToLang } from "./language_mapper.js"
import TreeContext from "./tree_context.js"
import Parser from "tree-sitter"
import fs from "fs"
import path from "path"
import MultiDirectedGraph from 'graphology'
import pagerank from 'graphology-metrics/centrality/pagerank'
import { get_encoding } from "tiktoken"


export default class RepoMap {
  constructor(root = null, mapTokens = 1024) {
    this.root = root ? root : process.cwd()
    this.maxMapTokens = mapTokens
    this.encoding = get_encoding("cl100k_base")
  }

  getRankedTagsMap(chatFnames, otherFnames = []) {
    const rankedTags = this.getRankedTags(chatFnames, otherFnames)
    // console.debug(rankedTags)
    const numTags = rankedTags.length
    let lowerBound = 0
    let upperBound = numTags
    let bestTree = null

    const chatRelFnames = chatFnames.map((fname) => this.getRelFname(fname))
    while (lowerBound <= upperBound) {
      let middle = Math.floor((lowerBound + upperBound) / 2)
      let tree = this.toTree(rankedTags.slice(0, middle), chatRelFnames)
      let numTokens = this.tokenCount(tree)

      if (numTokens < this.maxMapTokens) {
        bestTree = tree
        lowerBound = middle + 1
      } else {
        upperBound = middle - 1
      }
    }
    return bestTree
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

          const key = [relFname, tag.name].toString()
          if (!definitions.get(key)) definitions.set(key, new Set())
          definitions.get(key).add(tag)
        } else if (tag.kind === 'ref') {
          if (!references.get(tag.name)) references.set(tag.name, [])
          references.get(tag.name).push(relFname)
        }
      }
    }

    if (!references) {
      defines.forEach((value, key) => references.set(key, Array.from(value)))
    }
    // console.log("================define===============")
    // console.log("================define===============")
    // console.log(defines)
    // console.log("================references===============")
    // console.log("================references===============")
    // console.log(references)
    // console.log("================definitions===============")
    // console.log("================definitions===============")
    // console.log(definitions)

    const myGraph = new MultiDirectedGraph({ multi: true })
    const idents = new Set(
      [...defines.keys()].filter(dValue => references.has(dValue))
    )
    for (let ident of idents) {
      let definers = defines.get(ident)
      let counters = {}
      references.get(ident)?.forEach((referencer) => {
        counters[referencer] = (counters[referencer] || 0) + 1
      })
      references.get(ident)?.forEach((referencer) => {
        myGraph.mergeNode(referencer)
        for (let definer of definers) {
          myGraph.mergeNode(definer)
          myGraph.addEdge(referencer, definer, { weight: counters[referencer], ident: ident })
        }
      })
    }

    let ranked = null
    try {
      ranked = pagerank(myGraph)
    } catch (err) {
      // console.log(err)
      return []
    }
    const rankedDefinitions = new Map()
    myGraph.forEachNode((src) => {
      let srcRank = ranked[src]
      let totalWeight = 0
      myGraph.forEachOutboundEdge(src, (_, attributes) => totalWeight += attributes.weight)
      myGraph.forEachOutboundEdge(src, (edge, attributes, source, target) => {
        attributes.rank = srcRank * attributes.weight / totalWeight
        let ident = attributes.ident
        let rankedDefKey = [target, ident].toString()
        rankedDefinitions.set(rankedDefKey, (rankedDefinitions.get(rankedDefKey) || 0.0) + attributes.rank)
      })
    })

    let rankedTags = []
    const sortedRankedDefinitions = [...rankedDefinitions.entries()].sort((a, b) => b[1] - a[1])
    for (let [key,] of sortedRankedDefinitions) {
      let [fname,] = key.split(',')
      if (chatFnames.includes(fname)) continue
      rankedTags = rankedTags.concat([...definitions.get(key)])
    }

    const relOtherFnamesWithoutTags = new Set(otherFnames.map((fname) => this.getRelFname(fname)))
    const fnamesAlreadyIncluded = new Set(rankedTags.map((rt) => rt.relFname))
    const topRank = Object.entries(ranked).sort((a, b) => b[1] - a[1])

    for (let [fname, _] of topRank) {
      if (relOtherFnamesWithoutTags.has(fname)) relOtherFnamesWithoutTags.delete(fname)
      if (!fnamesAlreadyIncluded.has(fname)) rankedTags.push({ relFname: fname })
    }

    for (let fname of relOtherFnamesWithoutTags) {
      rankedTags.push({ relFname: fname })
    }

    // console.debug(sortedRankedDefinitions)
    // console.debug(relOtherFnamesWithoutTags)
    // console.debug(fnamesAlreadyIncluded)
    // console.debug(topRank)
    // console.debug(rankedTags)
    return rankedTags
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
      else continue

      tags.push({
        relFname: relFname,
        fname: fname,
        name: match.node.text,
        kind: kind,
        line: match.node.startPosition.row,
      })
    }
    return tags
  }

  toTree(tags, chatRelFnames) {
    if (!tags) return ''

    tags = tags.filter((t) => !chatRelFnames.includes(t.relFname))
    // console.log('BEGIN --------------------------')
    // console.log(tags)
    // console.log('END --------------------------')
    tags.sort((a, b) => a.line - b.line).sort((a, b) => {
      if (a.relFname < b.relFname) return -1
      else if (a.relFname > b.relFname) return 1
      else return 0
    })
    let curFname = null
    let context = null
    let output = ''
    const dummyTag = { relFname: null }
    for (let tag of tags.concat(dummyTag)) {
      let thisRelFname = tag.relFname
      if (thisRelFname != curFname) {
        if (context) {
          context.addContext()
          output += "\n"
          output += curFname + ":\n"
          output += context.format()
          context = null
        } else if (curFname) output += "\n" + curFname + "\n"

        if (tag.kind) {
          let code = fs.readFileSync(tag.fname, 'utf8') || '';
          context = new TreeContext(
            tag.relFname,
            code,
            false,
            true,
            false,
            false,
            0,
            false,
            10, false, 0
          )
        }
        curFname = thisRelFname
      }

      if (context) {
        context.addLinesOfInterest([tag.line])
      }
    }
    return output
  }

  getRelFname(fname) {
    return path.relative(this.root, fname);
  }

  tokenCount(str) {
    return this.encoding.encode(str).length
  }
}



