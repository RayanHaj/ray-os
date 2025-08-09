import type { Ref } from 'vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';
import { useWindowSnappingManager } from '@/composables/window/useWindowSnappingManager.ts';
import { useBrowserStore } from '@/stores/browser.ts';

type StyleProps = {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
  display: string;
  cursor: string;
  transition: string;
};

export function useWindowPositionManager(
  styles: Ref<StyleProps>,
  windowRef: Ref,
  currentCorner: Ref<string>,
  windowStateManager: ReturnType<typeof useWindowStateManager>,
  windowSnappingManager: ReturnType<typeof useWindowSnappingManager>,
  oldPosition: Ref<{ clientX: number; clientY: number }>,
  windowId: string
) {
  const browserStore = useBrowserStore();

  function onMouseDownHeader(event: MouseEvent) {
    if (windowStateManager.isMaximized.value || currentCorner.value !== 'default') {
      return;
    }

    windowStateManager.isDraggingWindow.value = true;

    //Set initial position on mouse down
    oldPosition.value.clientX = event.clientX;
    oldPosition.value.clientY = event.clientY;

    addEventListener('mousemove', onMouseMove);
    addEventListener('mouseup', onMouseUp);
  }

  function onMouseUp(event: MouseEvent) {
    event.preventDefault();
    windowStateManager.isDraggingWindow.value = false;

    if (windowSnappingManager.showSnapLayout.value.show) {
      windowSnappingManager.showSnapLayout.value = {
        show: false,
        windowId: windowId,
      };
    }

    removeEventListener('mousemove', onMouseMove);
    removeEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event: MouseEvent) {
    event.preventDefault();

    if (windowStateManager.isSnapped.value === true) {
      windowStateManager.isSnapped.value = false;
    }

    const deltaX = oldPosition.value.clientX - event.clientX;
    const deltaY = oldPosition.value.clientY - event.clientY;

    styles.value.left = `${windowRef.value.offsetLeft - deltaX}px`;
    styles.value.top = `${windowRef.value.offsetTop - deltaY}px`;

    oldPosition.value.clientX = event.clientX;
    oldPosition.value.clientY = event.clientY;

    if (windowRef.value.getBoundingClientRect().top <= browserStore.heightExcTaskbar / 2) {
      if (!windowSnappingManager.showSnapLayout.value.show) {
        windowSnappingManager.showSnapLayout.value = {
          show: true,
          windowId: windowId,
        };
      }
    } else {
      if (windowSnappingManager.showSnapLayout.value.show) {
        windowSnappingManager.showSnapLayout.value = {
          show: false,
          windowId: windowId,
        };
      }
    }
  }

  return { onMouseDownHeader };
}
