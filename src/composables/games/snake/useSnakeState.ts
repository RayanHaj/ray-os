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
  const gameStatus: GameStatus = GameStatus.NOT_STARTED;

  const fruitPositions: FruitPosition[] = [];

  const START_POSITION_SNAKE = {
    x: Math.floor(useSnakeStore().GRID_ROWS / 2),
    y: Math.floor(useSnakeStore().GRID_COLUMNS / 2),
  };

  const snakePositions: SnakePosition[] = [
    START_POSITION_SNAKE,
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 1 },
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 2 },
    { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 3 },
  ];

  let snakeNextDirection: SnakeDirection | null = null;
  const setSnakeNextDirection = (nextDirection: SnakeDirection | null) => {
    const cantMoveSnakeToDirection =
      (snakeDirection === 'up' && nextDirection === 'down') ||
      (snakeDirection === 'down' && nextDirection === 'up') ||
      (snakeDirection === 'left' && nextDirection === 'right') ||
      (snakeDirection === 'right' && nextDirection === 'left');
    if (cantMoveSnakeToDirection) return;

    snakeNextDirection = nextDirection;
  };

  let snakeDirection: SnakeDirection = 'left';
  function moveSnake() {
    const headPosition = snakePositions[0];
    if (headPosition.x >= useSnakeStore().GRID_COLUMNS) {
      move({ x: 0 });
      return;
    }
    if (headPosition.x < 0) {
      move({ x: useSnakeStore().GRID_COLUMNS - 1 });
      return;
    }
    if (headPosition.y >= useSnakeStore().GRID_ROWS) {
      move({ y: 0 });
      return;
    }
    if (headPosition.y < 0) {
      move({ y: useSnakeStore().GRID_ROWS - 1 });
      return;
    }
    switch (snakeNextDirection ?? snakeDirection) {
      case 'left':
        move({ x: headPosition.x - 1 });
        break;
      case 'right':
        move({ x: headPosition.x + 1 });
        break;
      case 'up':
        move({ y: headPosition.y - 1 });
        break;
      case 'down': {
        move({ y: headPosition.y + 1 });
      }
    }

    function move(position: { x?: number; y?: number }) {
      snakePositions.unshift({ ...headPosition, ...position });
      snakePositions.pop();

      if (snakeNextDirection) {
        snakeDirection = snakeNextDirection;
      }

      snakeNextDirection = null;
    }
  }

  const getSnakeLength = () => snakePositions.length;

  return {
    gameStatus,
    moveSnake,
    getSnakeLength,
    setSnakeNextDirection,
    fruitPositions: readonly(fruitPositions),
    snakePositions,
  };
}
