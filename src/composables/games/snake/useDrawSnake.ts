import type { SnakePosition } from '@/composables/games/snake/useSnakeState.ts';
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
