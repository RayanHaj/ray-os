<script setup lang="ts">
import { useSnakeStore } from '@/stores/games/snake.ts';
import { ref } from 'vue';

const snakeStore = useSnakeStore();
const gameScore = ref<number>(0);

const setGameScore = (newGameScore: number) => (gameScore.value = newGameScore);
defineExpose({ setGameScore });
</script>
<template>
  <div
    class="score"
    :style="{ width: `${snakeStore.canvasWidth}px`, height: `${snakeStore.scoreHeight}px` }"
  >
    Score: {{ gameScore }}
  </div>
</template>
<style scoped></style>
