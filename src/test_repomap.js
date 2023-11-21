import RepoMap from "./repomap"

const repomap = new RepoMap()
repomap.getRankedTags(
  ['examples/snake/main.py'],
  [
    'examples/snake/snake.py',
    'examples/snake/food.py',
    'examples/snake/settings.py',
  ])