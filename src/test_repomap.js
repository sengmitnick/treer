import RepoMap from "./repomap"

const repomap = new RepoMap()
const output = repomap.getRankedTagsMap(
  ['examples/snake/main.py'],
  [
    'examples/snake/snake.py',
    'examples/snake/food.py',
    'examples/snake/settings.py',
  ])
  console.debug(output)