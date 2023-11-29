import { filenameToLang } from "./language_mapper"
import Parser from "tree-sitter"


export default class TreeContext {
  constructor(
    filename,
    code,
    lineNumber,
    parentContext,
    childContext,
    lastLine = true,
    margin = 3,
    markLois = true,
    headerMax = 10,
    showTopOfFileParentScope = true,
    loiPad = 1
  ) {
    this.filename = filename
    this.lineNumber = lineNumber
    this.lastLine = lastLine
    this.margin = margin
    this.markLois = markLois
    this.headerMax = headerMax
    this.loiPad = loiPad
    this.showTopOfFileParentScope = showTopOfFileParentScope

    this.parentContext = parentContext
    this.childContext = childContext

    const parser = new Parser();
    const [lang] = filenameToLang(filename)
    parser.setLanguage(lang);
    const tree = parser.parse(code);

    this.lines = code.split(/\r?\n/)
    this.numLines = this.lines.length

    this.outputLines = {}
    this.scopes = Array.from({ length: this.numLines }, () => new Set())
    this.headers = Array.from({ length: this.numLines }, () => [])
    this.nodes = Array.from({ length: this.numLines }, () => [])

    const rootNode = tree.rootNode
    this.walkTree(rootNode)

    for (let i = 0; i < this.numLines; i++) {
      this.headers[i].sort()
      let header = this.headers[i]
      // console.debug(i, this.headers[i])
      let size, headStart, headEnd
      if (header.length > 1) {
        [size, headStart, headEnd] = header[0]
        if (size > this.headerMax) headEnd = headStart + this.headerMax
      } else {
        headStart = i
        headEnd = i + 1
      }
      this.headers[i] = [headStart, headEnd]
      // console.debug(i, this.headers[i])
    }
    // console.debug(this.headers)
    this.showLines = new Set()
    this.linesOfInterst = new Set()
  }

  walkTree(node, depth = 0) {
    const start = node.startPosition
    const end = node.endPosition

    const startLine = start.row
    const endLine = end.row
    const size = endLine - startLine
    this.nodes[startLine].push(node)

    if (size) this.headers[startLine].push([size, startLine, endLine])
    for (let i = startLine; i <= endLine; i++) {
      this.scopes[i].add(startLine)
    }

    for (let child of node.children) {
      this.walkTree(child, depth + 1)
    }
    return startLine, endLine
  }

  addLinesOfInterest(lineNums) {
    lineNums.forEach((line) => this.linesOfInterst.add(line))
    // console.debug(this.linesOfInterst)
  }

  addContext() {
    if (!this.linesOfInterst) return

    this.doneParentScopes = new Set()
    this.showLines = new Set(this.linesOfInterst)
    // console.debug('Show lines of interest: ', this.linesOfInterst)

    if (this.loiPad) {
      for (let line of this.showLines) {
        for (let newLine of [line - this.loiPad, line + this.loiPad]) {
          if (Array.from(this.scopes[line] || []).find((s) => this.scopes[newLine].has(s))) {
            this.showLines.add(newLine)
          }
        }
      }
    }

    if (this.lastLine) {
      const buttomLine = this.numLines - 2
      this.showLines.add(buttomLine)
      this.addParentScopes(buttomLine)
    }
    if (this.parentContext) this.linesOfInterst.forEach((i) => {
      this.addParentScopes(i)
      // console.debug('Show lines: ', this.showLines)
    })
    if (this.childContext) this.linesOfInterst.forEach((i) => this.addChildContext(i))
    if (this.margin) [0, this.margin].forEach((i) => this.showLines.add(i))
    this.closeSmallGaps()
  }

  addParentScopes(line) {
    if (this.doneParentScopes.has(line)) return

    this.doneParentScopes.add(line)
    // console.debug(line, this.scopes[line])
    this.scopes[line]?.forEach((lineNum) => {
      let [headStart, headEnd] = this.headers[lineNum]
      // console.debug(headStart, headEnd, this.headers[lineNum])
      if (headStart > 0 || this.showTopOfFileParentScope) {
        for (let i = headStart; i < headEnd; i++) this.showLines.add(i)
      }
      if (this.lastLine) {
        let lastLine = this.getLastLineOfScope(lineNum)
        this.addParentScopes(lastLine)
      }
      // console.debug(this.showLines)
    })
  }

  addChildContext(line) {
    if (!this.nodes[line]) return

    const lastLine = this.getLastLineOfScope(line)
    const size = lastLine - line
    if (size < 5) {
      for (let i = line; i <= lastLine; i++) this.showLines.add(i)
      return
    }

    let children = []
    for (let node of this.nodes[line]) children = children.concat(this.findAllChildren(node))
    children.sort((a) => a.endPosition[0] - a.startPosition[0])

    const currentlyShowing = this.showLines.length
    let maxToShow = 25
    const minToShow = 5
    const percentToShow = 0.10
    maxToShow = Math.max(Math.min(size * percentToShow, maxToShow), minToShow)

    for (let child of children) {
      if (this.showLines.length > currentlyShowing + maxToShow) break
      this.addParentScopes(child.startPosition[0])
    }
  }

  getLastLineOfScope(line) {
    return Math.max(this.nodes[line]?.map((n) => n.endPosition[0]))
  }

  closeSmallGaps() {
    const closedShow = new Set(this.showLines)
    const sortedShow = [...this.showLines].sort()

    for (let i = 0; i < sortedShow.length - 1; i++) {
      if (sortedShow[i + 1] - sortedShow[i] === 2) {
        closedShow.add(sortedShow[i] + 1)
      }
    }

    for (let [i] of this.lines.entries()) {
      if (!closedShow.has(i)) continue
      if (this.lines[i].trim() && i < this.numLines - 2 && !this.lines[i + 1].trim()) closedShow.add(i + 1)
    }
    this.showLines = closedShow
  }

  findAllChildren(node) {
    let children = [node]
    for (let child of node.children) {
      children = children.concat(this.findAllChildren(child))
    }
    return children
  }

  format() {
    if (!this.showLines) return ''

    let output = ''
    let dots = !this.showLines.has(0)
    for (const [i, line] of this.lines.entries()) {
      if (!this.showLines.has(i)) {
        if (dots) {
          if (this.lineNumber) output += "...⋮...\n"
          else output += "⋮...\n"
          dots = false
        }
        continue
      }

      let spacer
      if (this.linesOfInterst.has(i) && this.markLois) {
        spacer = "█"
      } else {
        spacer = "│"
      }

      let lineOutput = `${spacer}${this.outputLines[i] || line}`
      if (this.lineNumber) lineOutput = (i + 1).toString().padStart(3, ' ') + lineOutput
      output += lineOutput + "\n"

      dots = true
    }
    return output
  }

  getlinesOfInterst() {
    return this.linesOfInterst
  }
}
