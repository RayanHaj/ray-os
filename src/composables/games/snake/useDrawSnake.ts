import type { FruitPosition, SnakePosition } from '@/composables/games/snake/useSnakeState.ts';
import { useSnakeStore } from '@/stores/games/snake.ts';

export function useDrawSnake(
  context: CanvasRenderingContext2D | null,
  snakePositions: SnakePosition[],
) {
  if (!context) return;

  const snakeStore = useSnakeStore();
  for (const snakePosition of snakePositions) {
    context.fillStyle = '#ff8080';
    context.fillRect(
      snakePosition.x * snakeStore.SNAKE_BLOCK_SIZE,
      snakePosition.y * snakeStore.SNAKE_BLOCK_SIZE,
      snakeStore.SNAKE_BLOCK_SIZE,
      snakeStore.SNAKE_BLOCK_SIZE,
    );
  }
}

export function useDrawFruits(
  context: CanvasRenderingContext2D | null,
  fruitPositions: FruitPosition[]
) {
  if (!context) return;

  const snakeStore = useSnakeStore();
  for (const snakePosition of fruitPositions) {
    context.fillStyle = '#FF0000';
    context.fillRect(
      snakePosition.position.x * snakeStore.SNAKE_BLOCK_SIZE,
      snakePosition.position.y * snakeStore.SNAKE_BLOCK_SIZE,
      snakeStore.SNAKE_BLOCK_SIZE,
      snakeStore.SNAKE_BLOCK_SIZE,
    );
  }
}
