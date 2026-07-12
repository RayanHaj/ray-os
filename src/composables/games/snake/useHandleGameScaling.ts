import { useWindowStore } from '@/stores/window.ts';
import { type StyleValue, watch } from 'vue';
import { useSnakeStore } from '@/stores/games/snake.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import type { WindowStyleObject } from '@/types/windowTypes.ts';

export function useHandleGameScaling(windowStyles: WindowStyleObject) {
  const windowStore = useWindowStore();
  const snakeStore = useSnakeStore();
  const browserStore = useBrowserStore();

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
        (browserStore.isMobile === true ? snakeStore.mobileControlsHeight : 0) -
        20;

      const blockSizeX = Math.floor(rawCanvasWidth / snakeStore.gridRows);
      const blockSizeY = Math.floor(rawCanvasHeight / snakeStore.gridColumns);

      const canvasWidth = rawCanvasWidth - (rawCanvasWidth % blockSizeX);
      const canvasHeight = rawCanvasHeight - (rawCanvasHeight % blockSizeY);

      snakeStore.canvasWidth = Math.floor(canvasWidth);
      snakeStore.canvasHeight = Math.floor(canvasHeight);
    },
    { immediate: true },
  );
}
