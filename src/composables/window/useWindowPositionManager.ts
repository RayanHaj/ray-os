import { type Ref } from 'vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';
import { useWindowStore } from '@/stores/window.ts';

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
  windowId: string,
  currentCorner: Ref<string>,
  windowStateManager: ReturnType<typeof useWindowStateManager>,
  oldPosition: Ref<{ clientX: number; clientY: number }>,
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

    if (windowRef.value.getBoundingClientRect().top <= browserStore.heightExcTaskbar / 2) {
      snapLayoutStore.openSnapLayout(windowId, 'beam');
    }

    addEventListener('mousemove', onMouseMove);
    addEventListener('mouseup', onMouseUp);
  }

  const snapLayoutStore = useSnapLayoutStore();

  function onMouseUp(event: MouseEvent) {
    event.preventDefault();
    windowStateManager.isDraggingWindow.value = false;

    if (snapLayoutStore.currentSnapLayoutSession.showSnapLayout === 'beam') {
      snapLayoutStore.currentSnapLayoutSession.showSnapLayout = '';
    }

    removeEventListener('mousemove', onMouseMove);
    removeEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event: MouseEvent) {
    event.preventDefault();

    if (windowStateManager.isSnapped.value) {
      windowStateManager.isSnapped.value = false;
    }

    const deltaX = oldPosition.value.clientX - event.clientX;
    const deltaY = oldPosition.value.clientY - event.clientY;

    const left = windowRef.value.offsetLeft - deltaX;

    const computedStyles = getComputedStyle(windowRef.value);
    const windowWidth = Number(computedStyles.width.split('px')[0]);
    const windowHeight = Number(computedStyles.height.split('px')[0]);

    const windowStore = useWindowStore();
    const rightOutOfBounds = left + windowWidth >= useBrowserStore().width;
    const leftOutOfBounds = left <= 0;
    const topOutOfBounds = event.clientY <= 0;
    const bottomOutOfBounds = event.clientY > (useBrowserStore().heightExcTaskbar - windowHeight) + 25;

    if (rightOutOfBounds || leftOutOfBounds || topOutOfBounds || bottomOutOfBounds) {
      windowStore.windowOutOfBounds = { ...windowStore.windowOutOfBounds, windowId: windowId };
    }

    if (topOutOfBounds) {
      windowStore.windowOutOfBounds = { ...windowStore.windowOutOfBounds, side: 'top' };
    } else if (rightOutOfBounds) {
      windowStore.windowOutOfBounds = { ...windowStore.windowOutOfBounds, side: 'right' };
    } else if (leftOutOfBounds) {
      windowStore.windowOutOfBounds = { ...windowStore.windowOutOfBounds, side: 'left' };
    } else if (
      windowStore.windowOutOfBounds.windowId !== '' &&
      windowStore.windowOutOfBounds.side !== ''
    ) {
      windowStore.windowOutOfBounds = { windowId: '', side: '' };
    }

    styles.value.left = `${windowRef.value.offsetLeft - deltaX}px`;
    styles.value.top = `${windowRef.value.offsetTop - deltaY}px`;

    oldPosition.value.clientX = event.clientX;
    oldPosition.value.clientY = event.clientY;
  }

  return { onMouseDownHeader };
}
