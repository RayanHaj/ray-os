.
<script setup lang="ts">
import { useSnakeStore } from '@/stores/games/snake.ts';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { useSnakeState } from '@/composables/games/snake/useSnakeState.ts';
import { useDrawSnake } from '@/composables/games/snake/useDrawSnake.ts';

const state = useSnakeState();

const canvas = useTemplateRef('canvas');
const context = ref<CanvasRenderingContext2D | null>(null);

const TICK_INTERVAL = 100;
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

function draw() {
  if (!context.value) return;

  context.value.fillStyle = Math.random() > 0.5 ? '#ff8080' : '#0099b0';
  context.value.fillRect(0, 0, 350, 350);
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      state.updateSnakeDirection('left');
      break;
    case 'ArrowRight':
      state.updateSnakeDirection('right');
      break;
    case 'ArrowUp':
      state.updateSnakeDirection('up');
      break;
    case 'ArrowDown':
      state.updateSnakeDirection('down');
  }
}
</script>
<template>
  <canvas
    ref="canvas"
    @keyup.prevent="onKeyUp"
    :width="useSnakeStore().CANVAS_WIDTH"
    :height="useSnakeStore().CANVAS_HEIGHT"
    tabindex="0"
  />
</template>
<style scoped>
canvas {
  outline: none;
}
</style>
