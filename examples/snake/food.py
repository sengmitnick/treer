import pygame
import random

# 食物类
class Food:
    def __init__(self, screen, snake):
        """
        初始化食物
        :param screen: 游戏窗口
        :param snake: 蛇对象
        """
        self.screen = screen
        self.snake = snake
        self.width = 10
        self.height = 10
        self.color = (0, 255, 0)  # 食物颜色
        self.position = [0, 0]  # 食物位置
        self.generate()  # 生成食物

    def generate(self):
        """
        生成食物，确保食物不会出现在蛇的身体上
        """
        while True:
            x = random.randint(0, self.screen.get_width() - self.width)
            y = random.randint(0, self.screen.get_height() - self.height)
            self.position = [x, y]
            # 检查食物是否在蛇身上
            if self.position not in self.snake.body:
                break

    def draw(self):
        """
        在窗口上绘制食物
        """
        pygame.draw.rect(self.screen, self.color, pygame.Rect(self.position[0], self.position[1], self.width, self.height))
