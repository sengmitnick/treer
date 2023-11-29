## treer ##
Treer is a commandline tool to generate directory structure tree

<a href="https://badge.fury.io/js/treer"><img src="https://badge.fury.io/js/treer.svg" alt="npm version" height="18"></a>

## install ##

```
$ npm install @smk17/treer -g
```

## usage ##

```
$ treer --help

  Usage: treer [options]

  Options:
    -h, --help             output usage information
    -V, --version          output the version number
    -d, --directory [dir]  Please specify a directory to generate structure tree
    -i, --ignore [ig]      You can ignore specific directory name (default: ".git")
    -e, --export [epath]   export into file
    -f, --only-folder      output folder only
    -j, --json             output tree json
    -a, --flat             output flatten array
    -m, --markdown         output markdown
    -r, --repomap          output repomap
    -h, --help             output usage information
```

## Available Options: ##
`-d` Specify a directory path to generate it's structure tree

`-i` or `--ignore` the directory name pattern to skip, it also support regex:

```
$ treer -i "/^regex$/"
```

`-e` or `--export` export into file

### example: ###
```
$ treer -e ./result.txt -i .git


treer
├─.DS_Store
├─.gitignore
├─README.md
├─package.json
├─result.txt
├─src
|  └index.js
├─node_modules
|      ├─graceful-readlink
|      |         ├─.npmignore
|      |         ├─.travis.yml
|      |         ├─LICENSE
|      |         ├─README.md
|      |         ├─index.js
|      |         └package.json
|      ├─commander
|      |     ├─History.md
|      |     ├─LICENSE
|      |     ├─Readme.md
|      |     ├─index.js
|      |     └package.json


The result has been saved into ./result.txt
```

### repomap example: ###
```
$ treer -r


examples/snake/food.py:
⋮...
│class Food:
│    def __init__(self, screen, snake):
│        """
│        初始化食物
│        :param screen: 游戏窗口
│        :param snake: 蛇对象
│        """
│        self.screen = screen
│        self.snake = snake
│        self.width = 10
│        self.height = 10
⋮...
│    def generate(self):
⋮...
│    def draw(self):
⋮...

examples/snake/settings.py

examples/snake/snake.py:
⋮...
│class Snake:
│    def __init__(self, screen):
│        """
│        初始化贪吃蛇
│        :param screen: 游戏窗口
│        """
│        self.screen = screen
│        self.width = 10
│        self.height = 10
│        self.color = (255, 0, 0)  # 蛇的颜色
│        self.speed = SNAKE_SPEED  # 蛇的速度
⋮...
│    def move(self):
⋮...
│    def draw(self):
⋮...
```

## test ##

```sh
$ node src/index.js -d examples/web -r
$ node src/index.js -d examples/python -r
$ node src/index.js -d examples/typescript -r
```