import type { FruitPosition, SnakePosition } from '@/composables/games/snake/useSnakeState.ts';
import { useSnakeStore } from '@/stores/games/snake.ts';

export function useDrawSnake(
  context: CanvasRenderingContext2D | null,
  snakePositions: SnakePosition[],
  color?: string,
) {
  if (!context) return;

  const snakeStore = useSnakeStore();
  for (const snakePosition of snakePositions) {
    context.fillStyle = color ?? '#ff8080';
    context.fillRect(
      snakePosition.x * snakeStore.snakeBlockSize.x,
      snakePosition.y * snakeStore.snakeBlockSize.y,
      snakeStore.snakeBlockSize.x,
      snakeStore.snakeBlockSize.y,
    );
  }
}

export function useDrawFruits(
  context: CanvasRenderingContext2D | null,
  fruitPositions: FruitPosition[],
  color?: string,
) {
  if (!context) return;

  const snakeStore = useSnakeStore();
  for (const snakePosition of fruitPositions) {
    context.fillStyle = color ?? '#FF0000';
    context.fillRect(
      snakePosition.position.x * snakeStore.snakeBlockSize.x,
      snakePosition.position.y * snakeStore.snakeBlockSize.y,
      snakeStore.snakeBlockSize.x,
      snakeStore.snakeBlockSize.y,
    );
  }
}
