import { filenameToLang } from "./language_mapper.js"
import Parser from "tree-sitter"
import fs from "fs"
import path from "path"
import MultiDirectedGraph from 'graphology'
import pagerank from 'graphology-metrics/centrality/pagerank'


export default class RepoMap {
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
      rankedTags.push({relFname: fname})
    }

    // console.debug(sortedRankedDefinitions)
    console.debug(relOtherFnamesWithoutTags)
    console.debug(fnamesAlreadyIncluded)
    // console.debug(topRank)
    console.debug(rankedTags)
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
        line: match.node.startPosition,
      })
    }
    return tags
  }

  getRelFname(fname) {
    return path.relative(this.root, fname);
  }
}



