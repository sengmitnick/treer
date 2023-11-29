#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const ignore = require("ignore");
const program = require("commander");
const pack = require("../package.json");
const { RepoMap } = require("./repomap");

program
  .version(pack.version)
  .option(
    "-d, --directory [dir]",
    "Please specify a directory to generate structure tree",
    process.cwd()
  )
  .option("-i, --ignore [ig]", "You can ignore specific directory name", ".git")
  .option("-e, --export [epath]", "export into file")
  .option("-f, --only-folder", "output folder only")
  .option("-j, --json", "output tree json")
  .option("-a, --flat", "output flatten array")
  .option("-m, --markdown", "output markdown")
  .option("-r, --repomap", "output repomap")
  .parse(process.argv);

let ignoreRegex = null;

if (program.ignore) {
  //trim program.ignore
  program.ignore = program.ignore.replace(/^\s*|\s*$/g, "");

  if (/^\/.+\/$/.test(program.ignore)) {
    program.ignore = program.ignore.replace(/(^\/)|(\/$)/g, "");
    ignoreRegex = new RegExp(program.ignore, "");
  } else {
    //escape special character
    program.ignore = program.ignore.replace(/[-[\]{}*+?,\\^$|#\s]/g, "\\$&");
    ignoreRegex = new RegExp("^" + program.ignore + "$", "");
  }
}

const dirToJson = (path) => {
  let stats = fs.lstatSync(path),
    structure = {};

  if (stats.isDirectory()) {
    let dir = fs.readdirSync(path);

    if (ignoreRegex) {
      dir = dir.filter((val) => {
        return !ignoreRegex.test(val);
      });
    }
    dir = dir
      .filter((child) => {
        let childStats = fs.lstatSync(path + "/" + child);
        return program.onlyFolder ? childStats.isDirectory() : true;
      })
      .map((child) => {
        return dirToJson(path + "/" + child);
      });
    let dirName = path.replace(/.*\/(?!$)/g, "");
    structure[dirName] = sortDir(dir);
  } else {
    let fileName = path.replace(/.*\/(?!$)/g, "");
    return fileName;
  }
  return structure;
};

const result = dirToJson(program.directory);
const characters = {
  border: "|",
  contain: "├",
  line: "─",
  last: "└",
};

let outputString = "";

const drawDirTree = (data, placeholder) => {
  let { border, contain, line, last } = characters;
  for (let i in data) {
    if (typeof data[i] === "string") {
      // console.log(placeholder + data[i])
      outputString += "\n" + placeholder + data[i];
    } else if (Array.isArray(data[i])) {
      // console.log(placeholder + i)
      outputString += "\n" + placeholder + i;
      placeholder = placeholder.replace(new RegExp(`${contain}`, "g"), border);
      placeholder = placeholder.replace(new RegExp(`${line}`, "g"), " ");

      placeholder =
        placeholder + Array(Math.ceil(i.length / 2)).join(" ") + contain + line;

      placeholder = placeholder.replace(new RegExp("^ +", "g"), "");
      data[i].forEach((val, idx, arr) => {
        let pl = placeholder;
        //if the idx is the last one, change the character
        if (idx === arr.length - 1) {
          let regex = new RegExp(`${contain}${line}$`, "g");

          pl = placeholder.replace(regex, last);
        }

        if (typeof val === "string") {
          // console.log(pl + val)
          outputString += "\n" + pl + val;
        } else {
          let pl = placeholder;
          drawDirTree(val, pl);
        }
      });
    }
  }
};

function flattenJSON(data, prefix = "") {
  let result = [];

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (typeof item === "object") {
        result = result.concat(flattenJSON(item, prefix));
      } else {
        result.push(`${prefix}${data[index]}`);
      }
    });
  } else if (typeof data === "object") {
    for (let key in data) {
      if (typeof data[key] === "object") {
        result = result.concat(flattenJSON(data[key], `${prefix}${key}/`));
      } else {
        result.push(`${prefix}${data[key]}`);
      }
    }
  }

  return result;
}

if (program.repomap) {
  const flattenData = flattenJSON(result[Object.keys(result)[0]]);
  const filterData = ignore()
    .add(fs.readFileSync(path.join(program.directory, ".gitignore")).toString())
    .filter(flattenData);

  const repomap = new RepoMap(program.directory);
  const output = repomap.getRankedTagsMap([], filterData);
  outputString = output || "";
} else if (program.json) {
  outputString = JSON.stringify(result, null, 2);
} else if (program.flat) {
  const flattenData = flattenJSON(result[Object.keys(result)[0]]);
  const filterData = ignore()
    .add(fs.readFileSync(path.join(program.directory, ".gitignore")).toString())
    .filter(flattenData);
  outputString = JSON.stringify(filterData, null, 2);
} else {
  drawDirTree(result, "");
  outputString = outputString.replace(/^\n/, "");
}

if (program.markdown) {
  outputString = `\`\`\`json\n${outputString}\n\`\`\``;
}

console.log(outputString);

//if export path is specified
if (program.export) {
  fs.writeFile(program.export, outputString, (err) => {
    if (err) throw err;
    console.log("\n\n" + "The result has been saved into " + program.export);
  });
}

function sortDir(arr) {
  let i = arr.length - 1;
  while (i >= 0) {
    if (typeof arr[i] === "object") {
      let obj = arr.splice(i, 1);
      arr.push(obj[0]);
    }
    i--;
  }
  return arr;
}
