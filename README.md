
## install ##

```
$ npm install
```

## usage ##

```
$ npm run repomap
```

### example: ###
```
$ npm run repomap


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


