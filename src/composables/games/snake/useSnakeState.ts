import { useSnakeStore } from '@/stores/games/snake.ts';

export const fruitTypes = ['banana', 'apple', 'poison'] as const;
export type FruitType = (typeof fruitTypes)[number];

export enum GameStatus {
  NOT_STARTED,
  PLAYING,
  GAME_OVER,
}

export type FruitPosition = { fruitType: FruitType; position: { x: number; y: number } };
export type SnakePosition = { x: number; y: number };
export type SnakeDirection = 'left' | 'right' | 'up' | 'down';

export function useSnakeState() {
  const gameStatus: GameStatus = GameStatus.NOT_STARTED;

  const fruitPositions: FruitPosition[] = [];

  function positionContainsSnake(position: { x: number; y: number }) {
    for (const snakePosition of snakePositions) {
      if (snakePosition.y === position.y && snakePosition.x === position.x) {
        return true;
      }
    }

    return false;
  }

  function spawnFruit() {
    let position: { x: number; y: number } = {
      x: Math.floor(Math.random() * useSnakeStore().GRID_ROWS ),
      y: Math.floor(Math.random() * useSnakeStore().GRID_COLUMNS ),
    };

    while (positionContainsSnake(position)) {
      position = {
        x: Math.floor(Math.random() * useSnakeStore().GRID_ROWS),
        y: Math.floor(Math.random() * useSnakeStore().GRID_COLUMNS),
      };
    }

    const randomFruit = Math.floor(Math.random() * fruitTypes.length);
    fruitPositions.push({ fruitType: fruitTypes[randomFruit] as FruitType, position });
  }

  function checkAndHandleFruitEaten() {
    const snakeHead = snakePositions[0];
    for (let i = 0; i < fruitPositions.length; i++) {
      if (
        snakeHead.x === fruitPositions[i].position.x &&
        snakeHead.y === fruitPositions[i].position.y
      ) {
        fruitPositions.splice(i, 1);
        spawnFruit();
        moveSnake(true);
        return true;
      }
    }

    return false;
  }

  function checkAndHandleSnakeCollision() {
    const snakeHead = snakePositions[0];
    for (let i = 1; i < snakePositions.length; i++) {
      const snakePosition = snakePositions[i];
      if (snakeHead.x === snakePosition.x && snakeHead.y === snakePosition.y) {
        resetGame();
        return true;
      }
    }

    return false
  }

  function resetGame() {
    fruitPositions.length = 0;
    snakePositions.length = 0;

    snakePositions.push(
      START_POSITION_SNAKE,
      { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 1 },
      { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 2 },
      { ...START_POSITION_SNAKE, x: START_POSITION_SNAKE.y + 3 },
    );

    snakeDirection = 'left';
    snakeNextDirection = null;

    spawnFruit();
  }

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
  function moveSnake(incrementSnakeLength = false) {
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

      if (!incrementSnakeLength) snakePositions.pop();

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
    spawnFruit,
    getSnakeLength,
    checkAndHandleFruitEaten,
    checkAndHandleSnakeCollision,
    setSnakeNextDirection,
    fruitPositions,
    snakePositions,
  };
}
