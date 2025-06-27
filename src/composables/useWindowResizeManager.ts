import { ref, type Ref } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/WindowTypes.ts';
import { useWindowStateManager } from '@/composables/useWindowStateManager.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useWindowStore } from '@/stores/window.ts';

export function useWindowResizeManager(
  styles: Ref<WindowStyleObject>,
  reference: WindowFlatReference,
  window: Ref,
  windowStateManager: ReturnType<typeof useWindowStateManager>,
) {
  const currentCorner = ref('default');
  const isMouseDown = ref(false);
  function onMouseDownWindow() {
    useWindowStore().setWindowZIndexToTop(reference);
    if (currentCorner.value !== 'default') {
      isMouseDown.value = true;
      document.body.style.cursor = styles.value.cursor;

      addEventListener('mousemove', resizeWindow);
      addEventListener('mouseup', onMouseUpWindow);
    }
  }

  function onMouseUpWindow() {
    isMouseDown.value = false;
    styles.value.transition = 'width 0.5s, height 0.5s, left 0.5s, top 0.5s';
    document.body.style.cursor = '';

    removeEventListener('mousemove', resizeWindow);
    removeEventListener('mouseup', onMouseUpWindow);
  }

  function resizeWindow(event: MouseEvent) {
    if (windowStateManager.isSnapped.value === true) {
      windowStateManager.isSnapped.value = false;
    }

    styles.value.transition = 'none';
    const splitValue = currentCorner.value.split(' ');
    if (splitValue.length === 1) {
      resizeWindowOnCornerMouseDown(event, splitValue[0]);
    } else {
      splitValue.forEach((value) => resizeWindowOnCornerMouseDown(event, value));
    }
  }

  function resizeWindowOnCornerMouseDown(event: MouseEvent, side: string) {
    const rect = window.value.getBoundingClientRect();

    const minHeight = Number(styles.value.minHeight.replace('px', ''));
    const minWidth = Number(styles.value.minWidth.replace('px', ''));

    switch (side) {
      case 'north':
        {
          const heightChange = rect.top - event.clientY;
          const newHeight = rect.height + heightChange;
          if (newHeight <= minHeight) {
            styles.value.cursor = 'default';
            return;
          }

          styles.value.height = `${newHeight}px`;
          styles.value.top = `${event.clientY}px`;
        }
        break;
      case 'east':
        {
          const widthChange = event.clientX - rect.right;
          const newWidth = rect.width + widthChange;
          if (newWidth <= minWidth) {
            styles.value.cursor = 'default';
            return;
          }

          styles.value.width = `${newWidth}px`;
        }
        break;
      case 'south':
        {
          const heightChange = event.clientY - rect.bottom;
          const newHeight = rect.height + heightChange;
          if (newHeight <= minHeight) {
            styles.value.cursor = 'default';
            return;
          }

          styles.value.height = `${newHeight}px`;
        }
        break;
      case 'west': {
        const widthChange = rect.left - event.clientX;
        const newWidth = rect.width + widthChange;
        if (newWidth <= minWidth) {
          styles.value.cursor = 'default';
          return;
        }

        styles.value.width = `${newWidth}px`;
        styles.value.left = `${event.clientX}px`;
      }
    }
  }

  function onMouseMoveWindow(event: MouseEvent) {
    if (
      (isMouseDown.value && currentCorner.value !== 'default') ||
      windowStateManager.isDraggingWindow.value ||
      windowStateManager.isMaximized.value
    )
      return;

    const rect = window.value.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const edgeMargin = 7;
    const cornerMargin = 10;

    const onTopLeft = x <= cornerMargin && y <= cornerMargin;
    const onTopRight = x >= rect.width - cornerMargin && y <= cornerMargin;
    const onBottomLeft = x <= cornerMargin && y >= rect.height - cornerMargin;
    const onBottomRight = x >= rect.width - cornerMargin && y >= rect.height - cornerMargin;

    const onLeft = x <= edgeMargin && y > cornerMargin && y < rect.height - cornerMargin;
    const onRight =
      x >= rect.width - edgeMargin && y > cornerMargin && y < rect.height - cornerMargin;
    const onTop = y <= edgeMargin && x > cornerMargin && x < rect.width - cornerMargin;
    const onBottom =
      y >= rect.height - edgeMargin && x > cornerMargin && x < rect.width - cornerMargin;

    if (onTopLeft) {
      styles.value.cursor = 'nw-resize';
      currentCorner.value = 'north west';
    } else if (onTopRight) {
      styles.value.cursor = 'ne-resize';
      currentCorner.value = 'north east';
    } else if (onBottomLeft) {
      styles.value.cursor = 'sw-resize';
      currentCorner.value = 'south west';
    } else if (onBottomRight) {
      styles.value.cursor = 'se-resize';
      currentCorner.value = 'south east';
    } else if (onLeft) {
      styles.value.cursor = 'w-resize';
      currentCorner.value = 'west';
    } else if (onRight) {
      styles.value.cursor = 'e-resize';
      currentCorner.value = 'east';
    } else if (onTop) {
      styles.value.cursor = 'n-resize';
      currentCorner.value = 'north';
    } else if (onBottom) {
      styles.value.cursor = 's-resize';
      currentCorner.value = 'south';
    } else {
      styles.value.cursor = 'default';
      currentCorner.value = 'default';
    }
  }

  function maximizeWindow(
    cachedStyles: Ref<{ left: string; top: string; width: string; height: string }>,
  ) {
    // if already maximized, put window back into its position before it was maximized
    if (windowStateManager.isMaximized.value) {
      styles.value.height = cachedStyles.value.height;
      styles.value.width = cachedStyles.value.width;
      styles.value.left = cachedStyles.value.left;
      styles.value.top = cachedStyles.value.top;
      return;
    }

    cacheStyles(cachedStyles);
    maximize();
  }

  function cacheStyles(
    cachedStyles: Ref<{ left: string; top: string; width: string; height: string }>,
  ) {
    cachedStyles.value.height = styles.value.height;
    cachedStyles.value.width = styles.value.width;
    cachedStyles.value.left = styles.value.left;
    cachedStyles.value.top = styles.value.top;
  }

  function maximize() {
    const { heightExcTaskbar } = useBrowserStore();

    styles.value.width = '100%';
    styles.value.height = `${heightExcTaskbar}px`;
    styles.value.left = '0';
    styles.value.top = '0';
  }

  return { currentCorner, onMouseDownWindow, onMouseMoveWindow, maximizeWindow };
}
