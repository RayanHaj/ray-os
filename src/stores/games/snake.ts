import { defineStore } from 'pinia';

export const useSnakeStore = defineStore('snake', () => {
  const CANVAS_WIDTH = 350;
  const CANVAS_HEIGHT = 350;
  const SNAKE_BLOCK_SIZE = 14;

  const GRID_COLUMNS = Math.floor(CANVAS_WIDTH / SNAKE_BLOCK_SIZE);
  const GRID_ROWS = Math.floor(CANVAS_HEIGHT / SNAKE_BLOCK_SIZE);

  return {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_COLUMNS,
    GRID_ROWS,
    SNAKE_BLOCK_SIZE
  }
});
