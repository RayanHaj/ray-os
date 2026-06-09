.
<script setup lang="ts">
import { useSnakeStore } from '@/stores/games/snake.ts';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { useSnakeState } from '@/composables/games/snake/useSnakeState.ts';
import { useDrawSnake } from '@/composables/games/snake/useDrawSnake.ts';

const state = useSnakeState();

const canvas = useTemplateRef('canvas');
const context = ref<CanvasRenderingContext2D | null>(null);

const TICK_INTERVAL = 150;
const animationFrameId = ref<number>();
onMounted(() => {
  context.value = canvas.value?.getContext('2d') ?? null;
  animationFrameId.value = window.requestAnimationFrame(gameLoop);
});

onUnmounted(() => {
  if (!animationFrameId.value) return;
  window.cancelAnimationFrame(animationFrameId.value);
});

let previousTimeStamp = 0;
function gameLoop(timeStamp: number) {
  if (timeStamp - previousTimeStamp >= TICK_INTERVAL) {
    if (context.value) {
      context.value.clearRect(0, 0, useSnakeStore().CANVAS_WIDTH, useSnakeStore().CANVAS_HEIGHT);
    }
    state.moveSnake();
    previousTimeStamp = timeStamp;
  }

  useDrawSnake(context.value, state.snakePositions);

  animationFrameId.value = window.requestAnimationFrame(gameLoop);
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      state.setSnakeNextDirection('left');
      break;
    case 'ArrowRight':
      state.setSnakeNextDirection('right');
      break;
    case 'ArrowUp':
      state.setSnakeNextDirection('up');
      break;
    case 'ArrowDown':
      state.setSnakeNextDirection('down');
  }
}
</script>
<template>
  <div
    class="snake"
    @keydown.prevent="onKeyUp"
    :style="{
      width: `${useSnakeStore().CANVAS_WIDTH}px`,
      height: `${useSnakeStore().CANVAS_HEIGHT}px`,
    }"
    tabindex="0"
  >
    <canvas
      ref="canvas"
      :width="useSnakeStore().CANVAS_WIDTH"
      :height="useSnakeStore().CANVAS_HEIGHT"
    />
  </div>
</template>
<style scoped>
.snake {
  position: relative;
  overflow: hidden;
  outline: none;
}
.snake canvas {
  width: 100%;
  height: 100%;
}
</style>
