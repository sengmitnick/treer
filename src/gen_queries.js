#!/usr/bin/env node

const fs = require("fs");
const { globSync } = require("glob");

const queries = globSync("queries/*.scm").reduce((acc, file) => {
  const name = file.replace("queries/", "").replace(".scm", "");
  acc[name] = fs.readFileSync(file, "utf8");
  return acc;
}, {});

fs.writeFileSync("./src/repomap/queries.json", JSON.stringify(queries, null, 2));
