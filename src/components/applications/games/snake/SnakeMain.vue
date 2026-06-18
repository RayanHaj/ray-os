.
<script setup lang="ts">
import { useSnakeStore } from '@/stores/games/snake.ts';
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import { useSnakeState } from '@/composables/games/snake/useSnakeState.ts';
import { useDrawFruits, useDrawSnake } from '@/composables/games/snake/useDrawSnake.ts';
import { useSvgOrFallback } from '@/composables/svg/useSvgOrFallback.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import type { WindowStyleObject } from '@/types/windowTypes.ts';
import { useWindowStore } from '@/stores/window.ts';

const { windowStyles } = defineProps<{ windowStyles: WindowStyleObject }>();

const snakeStore = useSnakeStore();
const browserStore = useBrowserStore();

const state = useSnakeState();

const gameScore = ref<number>(0);

const canvas = useTemplateRef('canvas');
const context = ref<CanvasRenderingContext2D | null>(null);

const snakeColor = ref<string>();
watch(
  () => browserStore.currentTheme,
  () => {
    snakeColor.value = getComputedStyle(document.documentElement).getPropertyValue(
      '--accent-color',
    );
  },
  { immediate: true },
);

const snake = useTemplateRef('snake');
const windowStore = useWindowStore();
watch(
  () => [windowStyles.width, windowStyles.height],
  ([width, height]) => {
    const widthPxIndex = width.indexOf('px');
    const heightPxIndex = height.indexOf('px');

    if (widthPxIndex === -1 || heightPxIndex === -1) return;

    const widthNumber = Number(width.slice(0, widthPxIndex));
    const heightNumber = Number(height.slice(0, heightPxIndex));

    const rawCanvasWidth = widthNumber - 10;
    const rawCanvasHeight =
      heightNumber -
      windowStore.windowHeaderHeight -
      snakeStore.scoreHeight -
      (browserStore.isMobile === true ? snakeStore.mobileControlsHeight : 0) - 20;

    const blockSizeX = Math.floor(rawCanvasWidth / snakeStore.gridRows);
    const blockSizeY = Math.floor(rawCanvasHeight / snakeStore.gridColumns);

    const canvasWidth = rawCanvasWidth - (rawCanvasWidth % blockSizeX);
    const canvasHeight = rawCanvasHeight - (rawCanvasHeight % blockSizeY);

    snakeStore.WINDOW_WIDTH = canvasWidth;
    snakeStore.canvasWidth = Math.floor(canvasWidth);
    snakeStore.WINDOW_HEIGHT = canvasHeight;
    snakeStore.canvasHeight = Math.floor(canvasHeight);
  },
  { immediate: true },
);

const TICK_INTERVAL = 120;

const animationFrameId = ref<number | null>(null);
onMounted(() => {
  context.value = canvas.value?.getContext('2d') ?? null;
  state.spawnFruit();
  snake.value?.focus();
});

onUnmounted(() => {
  if (!animationFrameId.value) return;
  stopGameLoop();
});

let previousTimeStamp = 0;
function gameLoop(timeStamp: number) {
  if (timeStamp - previousTimeStamp >= TICK_INTERVAL) {
    if (context.value) {
      context.value.clearRect(0, 0, snakeStore.canvasWidth, snakeStore.canvasHeight);
    }
    const died = state.checkAndHandleSnakeCollision();

    if (died) {
      gameScore.value = state.getGameScore();
    }

    state.moveSnake();
    previousTimeStamp = timeStamp;
  }

  const eaten = state.checkAndHandleFruitEaten();

  if (eaten) {
    gameScore.value = state.getGameScore();
  }

  useDrawSnake(context.value, state.snakePositions, snakeColor.value);
  useDrawFruits(context.value, state.fruitPositions);

  startGameLoop();
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
        startGameLoop();
      } else {
        stopGameLoop();
      }
  }
}

function onControlButtonClick(buttonType: 'up' | 'down' | 'left' | 'right') {
  switch (buttonType) {
    case 'up':
      state.setSnakeNextDirection('up');
      break;
    case 'down':
      state.setSnakeNextDirection('down');
      break;
    case 'left':
      state.setSnakeNextDirection('left');
      break;
    case 'right':
      state.setSnakeNextDirection('right');
  }
}

function resetGameLoop() {
  state.resetState();
  gameScore.value = state.getGameScore();
}

function stopGameLoop() {
  if (!animationFrameId.value) return;
  window.cancelAnimationFrame(animationFrameId.value);
  animationFrameId.value = null;
}

function startGameLoop() {
  animationFrameId.value = window.requestAnimationFrame(gameLoop);
}

const playSvg = useSvgOrFallback('Play');
const resetSvg = useSvgOrFallback('Reset');
const settingsSvg = useSvgOrFallback('Settings');

const circleUpSvg = useSvgOrFallback('CircleUp');
const circleDownSvg = useSvgOrFallback('CircleDown');
const circleLeftSvg = useSvgOrFallback('CircleLeft');
const circleRightSvg = useSvgOrFallback('CircleRight');

const circlePauseSvg = useSvgOrFallback('CirclePause');
</script>
<template>
  <div ref="snake" class="snake" @keydown.prevent="onKeyUp" tabindex="0">
    <div
      class="score"
      :style="{ width: `${snakeStore.canvasWidth}px`, height: `${snakeStore.scoreHeight}px` }"
    >
      Score: {{ gameScore }}
    </div>
    <div
      v-show="animationFrameId === null"
      class="menu"
      :style="{
        width: `${snakeStore.canvasWidth}px`,
        height: `${snakeStore.canvasHeight}px`,
        minWidth: `${snakeStore.canvasWidth}px`,
        minHeight: `${snakeStore.canvasHeight}px`,
      }"
    >
      <button @click="startGameLoop()"><component :is="playSvg.svg" /></button>
      <button><component :is="settingsSvg.svg" /></button>
      <button @click="resetGameLoop()"><component :is="resetSvg.svg" /></button>
    </div>
    <canvas
      v-show="animationFrameId !== null"
      ref="canvas"
      :width="snakeStore.canvasWidth"
      :height="snakeStore.canvasHeight"
      :style="{ width: `${snakeStore.canvasWidth}px`, height: `${snakeStore.canvasHeight}px` }"
    />
    <div
      v-if="browserStore.isMobile"
      class="controls"
      :style="{ width: `${snakeStore.canvasWidth}px`, height: `${snakeStore.mobileControlsHeight}px` }"
    >
      <div class="top-controls">
        <button @click="onControlButtonClick('up')" class="control-button up">
          <component :is="circleUpSvg.svg" />
        </button>
      </div>
      <div class="center-controls">
        <button @click="onControlButtonClick('left')" class="control-button left">
          <component :is="circleLeftSvg.svg" />
        </button>
        <button class="control-button">
          <component :is="circlePauseSvg.svg" />
        </button>
        <button @click="onControlButtonClick('right')" class="control-button right">
          <component :is="circleRightSvg.svg" />
        </button>
      </div>
      <div class="bottom-controls">
        <button @click="onControlButtonClick('down')" class="control-button down">
          <component :is="circleDownSvg.svg" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.snake {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  outline: none;
}

.menu {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
}

.menu button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: var(--button-primary-color);
  border: none;
}

.menu button:hover {
  background-color: var(--button-hover-color);
}

.menu button svg {
  width: 35px;
  height: 35px;
}

.score,
.menu,
canvas {
  border: var(--input-border-color) solid 2px;
}

.score {
  border-radius: 5px 5px 0 0;
  padding: 5px;
}

.snake canvas {
  border-radius: 0 0 5px 5px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.top-controls,
.center-controls,
.bottom-controls {
  width: 100%;
  height: calc(100% / 3);
}

.top-controls,
.bottom-controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--button-primary-color);
  border: var(--input-border-color) 1px solid;
}

.control-button svg {
  width: 25px;
  height: 25px;
}
</style>
