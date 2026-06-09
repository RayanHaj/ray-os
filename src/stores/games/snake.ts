import { defineStore } from 'pinia';

export const useSnakeStore = defineStore('snake', () => {
  const CANVAS_WIDTH = 350;
  const CANVAS_HEIGHT = 350;
  const SNAKE_BLOCK_SIZE = 10;

  const GRID_COLUMNS = CANVAS_WIDTH / SNAKE_BLOCK_SIZE;
  const GRID_ROWS = CANVAS_HEIGHT / SNAKE_BLOCK_SIZE;

  return {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_COLUMNS,
    GRID_ROWS,
    SNAKE_BLOCK_SIZE
  }
});
