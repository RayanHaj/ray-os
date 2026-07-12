import { computed, ref, type Ref } from 'vue';
import { useDrawFruits, useDrawSnake } from '@/composables/games/snake/useDrawSnake.ts';
import { useSnakeStore } from '@/stores/games/snake.ts';
import type SnakeScore from '@/components/applications/games/snake/SnakeScore.vue';
import type { useSnakeState } from '@/composables/games/snake/useSnakeState.ts';

export function useGameLoop(
  state: ReturnType<typeof useSnakeState>,
  context: Ref<CanvasRenderingContext2D | null>,
  scoreRef: Ref<InstanceType<typeof SnakeScore> | null>,
  snakeColor: Ref<string | undefined>,
) {
  const snakeStore = useSnakeStore();

  let previousTimeStamp = 0;

  const TICK_INTERVAL = 120;
  const animationFrameId = ref<number | null>(null);
  function gameLoop(timeStamp: number) {
    if (timeStamp - previousTimeStamp >= TICK_INTERVAL) {
      if (context.value) {
        context.value.clearRect(0, 0, snakeStore.canvasWidth, snakeStore.canvasHeight);
      }
      const died = state.checkAndHandleSnakeCollision();

      if (died) {
        scoreRef.value?.setGameScore(state.getGameScore());
      }

      state.moveSnake();
      previousTimeStamp = timeStamp;
    }

    const eaten = state.checkAndHandleFruitEaten();

    if (eaten) {
      scoreRef.value?.setGameScore(state.getGameScore());
    }

    useDrawSnake(context.value, state.snakePositions, snakeColor.value);
    useDrawFruits(context.value, state.fruitPositions);

    startGameLoop();
  }

  const resetGameLoop = () => {
    state.resetState();
    scoreRef.value?.setGameScore(state.getGameScore());
  };

  const startGameLoop = () => {
    animationFrameId.value = window.requestAnimationFrame(gameLoop);
  };

  const stopGameLoop = () => {
    if (!animationFrameId.value) return;
    window.cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  };

  const gameLoopIsRunning = computed(() => animationFrameId.value !== null);

  return { resetGameLoop, startGameLoop, stopGameLoop, gameLoopIsRunning };
}
