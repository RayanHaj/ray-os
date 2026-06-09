import { readonly } from 'vue';
import { useSnakeStore } from '@/stores/games/snake.ts';

export type FruitType = 'banana' | 'apple' | 'poison';
export enum GameStatus {
  NOT_STARTED,
  PLAYING,
  GAME_OVER,
}

type FruitPosition = { fruitType: FruitType; position: { x: number; y: number } };
export type SnakePosition = { x: number; y: number };
export type SnakeDirection = 'left' | 'right' | 'up' | 'down';

export function useSnakeState() {
  const SNAKE_START_LENGTH = 4;

  const gameStatus: GameStatus = GameStatus.NOT_STARTED;

  const fruitPositions: FruitPosition[] = [];

  const START_POSITION_SNAKE = {
    x: useSnakeStore().GRID_ROWS / 2,
    y: useSnakeStore().GRID_COLUMNS / 2,
  };

  const snakePositions: SnakePosition[] = [
    START_POSITION_SNAKE,
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 1 },
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 2 },
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 3 },
  ];

  let snakeDirection: SnakeDirection = 'left';
  function moveSnake() {
    const headPosition = snakePositions[0];
    switch (snakeDirection) {
      case 'left':
        {
          snakePositions.unshift({ ...headPosition, x: headPosition.x - 1 });
          snakePositions.pop();
        }
        break;
      case 'right':
        {
          snakePositions.unshift({ ...headPosition, x: headPosition.x + 1 });
          snakePositions.pop();
        }
        break;
      case 'up':
        {
          snakePositions.unshift({ ...headPosition, y: headPosition.y - 1 });
          snakePositions.pop();
        }
        break;
      case 'down': {
        snakePositions.unshift({ ...headPosition, y: headPosition.y + 1 });
        snakePositions.pop();
      }
    }
  }

  function updateSnakeDirection(direction: SnakeDirection) {
    const cantMoveSnakeToDirection =
      (snakeDirection === 'up' && direction === 'down') ||
      (snakeDirection === 'down' && direction === 'up') ||
      (snakeDirection === 'left' && direction === 'right') ||
      (snakeDirection === 'right' && direction === 'left');
    if (cantMoveSnakeToDirection) return;

    snakeDirection = direction;
  }

  const getSnakeLength = () => snakePositions.length;

  return {
    gameStatus,
    moveSnake,
    getSnakeLength,
    updateSnakeDirection,
    fruitPositions: readonly(fruitPositions),
    snakePositions,
  };
}
