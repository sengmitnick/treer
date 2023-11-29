# main.py
import pygame
from settings import SCREEN_WIDTH, SCREEN_HEIGHT
from snake import Snake
from food import Food

def main():
    """
    主程序入口，控制游戏的主循环。
    """
    pygame.init()  # 初始化pygame

    # 设置游戏窗口
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption('贪吃蛇')  # 设置窗口标题

    clock = pygame.time.Clock()  # 创建时钟对象

    # 创建蛇对象和食物对象
    snake = Snake(screen)
    food = Food(screen, snake)

    while True:
        # 处理游戏事件
        for event in pygame.event.get():
            print(event.type, pygame.QUIT)
            if event.type == pygame.QUIT:
                pygame.quit()
                return
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP and snake.direction != 'down':
                    snake.direction = 'up'
                elif event.key == pygame.K_DOWN and snake.direction != 'up':
                    snake.direction = 'down'
                elif event.key == pygame.K_LEFT and snake.direction != 'right':
                    snake.direction = 'left'
                elif event.key == pygame.K_RIGHT and snake.direction != 'left':
                    snake.direction = 'right'

        # 控制蛇的移动
        if not snake.move():
            break  # 如果蛇不能移动，结束游戏

        # 检查蛇头是否吃到食物
        if snake.body[0] == food.position:
            food.generate()  # 生成新的食物
        else:
            snake.body.pop()  # 没有吃到食物，蛇需要移动，去掉蛇尾

        # 清屏
        screen.fill((0, 0, 0))

        # 绘制蛇和食物
        snake.draw()
        food.draw()

        # 更新游戏窗口
        pygame.display.update()

        # 控制游戏速度
        clock.tick(30)

if __name__ == '__main__':
    main()
