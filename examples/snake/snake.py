import pygame
from settings import SCREEN_WIDTH, SCREEN_HEIGHT, SNAKE_SPEED

# 贪吃蛇类
class Snake:
    def __init__(self, screen):
        """
        初始化贪吃蛇
        :param screen: 游戏窗口
        """
        self.screen = screen
        self.width = 10
        self.height = 10
        self.color = (255, 0, 0)  # 蛇的颜色
        self.speed = SNAKE_SPEED  # 蛇的速度
        self.direction = 'right'  # 蛇的初始方向
        self.body = [[50, 50], [40, 50], [30, 50]]  # 蛇的身体，初始为3段

    def move(self):
        """
        控制蛇的移动
        """
        # 根据蛇的方向，计算蛇头的新位置
        if self.direction == 'right':
            new_head = [self.body[0][0] + self.speed, self.body[0][1]]
        elif self.direction == 'left':
            new_head = [self.body[0][0] - self.speed, self.body[0][1]]
        elif self.direction == 'up':
            new_head = [self.body[0][0], self.body[0][1] - self.speed]
        elif self.direction == 'down':
            new_head = [self.body[0][0], self.body[0][1] + self.speed]

        # 检查蛇头是否超出屏幕范围
        if new_head[0] < 0 or new_head[0] > SCREEN_WIDTH or new_head[1] < 0 or new_head[1] > SCREEN_HEIGHT:
            return False

        # 检查蛇头是否撞到自己的身体
        if new_head in self.body[1:]:
            return False

        # 将新的蛇头添加到蛇身的前端
        self.body.insert(0, new_head)
        return True

    def draw(self):
        """
        在窗口上绘制蛇
        """
        for position in self.body:
            pygame.draw.rect(self.screen, self.color, pygame.Rect(position[0], position[1], self.width, self.height))
