import { defineStore } from 'pinia';

export const useSnakeStore = defineStore('snake', () => {
  const WINDOW_WIDTH = 300;
  const WINDOW_HEIGHT = 550;
  const CANVAS_WIDTH = 270;
  const CANVAS_HEIGHT = 300;
  const SNAKE_BLOCK_SIZE = 15;

  const GRID_COLUMNS = Math.floor(CANVAS_WIDTH / SNAKE_BLOCK_SIZE);
  const GRID_ROWS = Math.floor(CANVAS_HEIGHT / SNAKE_BLOCK_SIZE);

  return {
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    GRID_COLUMNS,
    GRID_ROWS,
    SNAKE_BLOCK_SIZE,
  };
});
