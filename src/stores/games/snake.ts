import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useSnakeStore = defineStore('snake', () => {
  const scoreHeight = 30;
  const mobileControlsHeight = 150;
  const canvasWidth = ref(270);
  const canvasHeight = ref(300);
  const snakeBlockSize = computed<{x: number, y: number}>(() =>{
    return {
      x: Math.floor(canvasWidth.value / gridRows.value),
      y: Math.floor(canvasHeight.value / gridColumns.value)
    }
  });

  const gridColumns = ref(30);
  const gridRows = ref(30);

  return {
    canvasWidth,
    canvasHeight,
    gridColumns,
    gridRows,
    snakeBlockSize,
    scoreHeight,
    mobileControlsHeight,
  };
});
