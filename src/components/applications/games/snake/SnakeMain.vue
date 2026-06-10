.
<script setup lang="ts">
import { useSnakeStore } from '@/stores/games/snake.ts';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { useSnakeState } from '@/composables/games/snake/useSnakeState.ts';
import { useDrawFruits, useDrawSnake } from '@/composables/games/snake/useDrawSnake.ts';

const state = useSnakeState();

const gameScore = ref<number>(0);

const canvas = useTemplateRef('canvas');
const context = ref<CanvasRenderingContext2D | null>(null);

const TICK_INTERVAL = 100;
const animationFrameId = ref<number | null>(null);
onMounted(() => {
  context.value = canvas.value?.getContext('2d') ?? null;
  animationFrameId.value = window.requestAnimationFrame(gameLoop);
  state.spawnFruit();
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
    state.checkAndHandleSnakeCollision();

    state.moveSnake();
    previousTimeStamp = timeStamp;
  }

  state.checkAndHandleFruitEaten();
  gameScore.value = state.gameScore;

  useDrawSnake(context.value, state.snakePositions);
  useDrawFruits(context.value, state.fruitPositions);

  animationFrameId.value = window.requestAnimationFrame(gameLoop);
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
    case 'a':
      state.setSnakeNextDirection('left');
      break;
    case 'ArrowRight':
    case 'd':
      state.setSnakeNextDirection('right');
      break;
    case 'ArrowUp':
    case 'w':
      state.setSnakeNextDirection('up');
      break;
    case 'ArrowDown':
    case 's':
      state.setSnakeNextDirection('down');
      break;
    case 'Escape':
      if (animationFrameId.value === null) {
        animationFrameId.value = window.requestAnimationFrame(gameLoop);
      } else {
        window.cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = null
      }
  }
}
</script>
<template>
  <div
    class="snake"
    @keydown.prevent="onKeyUp"
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
