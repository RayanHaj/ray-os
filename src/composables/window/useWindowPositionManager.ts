import { ref, type Ref } from 'vue';
import { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';

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
  windowStateManager: ReturnType<typeof useWindowStateManager>,
  currentCorner: Ref<string>,
  isFixed: boolean,
) {
  const browserStore = useBrowserStore();

  const oldPosition = ref({ clientX: 0, clientY: 0 });

  function onMouseDownHeader(event: MouseEvent) {
    if (windowStateManager.isMaximized.value || currentCorner.value !== 'default') {
      return;
    }

    windowStateManager.isDraggingWindow.value = true;

    //Set initial position on mouse down
    oldPosition.value.clientX = event.clientX;
    oldPosition.value.clientY = event.clientY;

    if (
      windowRef.value.getBoundingClientRect().top <= browserStore.heightExcTaskbar / 2 &&
      !isFixed
    ) {
      snapLayoutStore.openSnapLayout(windowStateManager.windowId, 'beam');
    }

    addEventListener('mousemove', onMouseMove);
    addEventListener('mouseup', onMouseUp);
  }

  const snapLayoutStore = useSnapLayoutStore();
  function onMouseUp(event: MouseEvent) {
    event.preventDefault();

    windowStateManager.isDraggingWindow.value = false;

    const windowWidth = windowRef.value.getBoundingClientRect().width;
    const windowHeight = windowRef.value.getBoundingClientRect().height;

    const windowLeft = parseInt(styles.value.left, 10);
    const windowRight = windowLeft + windowWidth;
    const windowTop = parseInt(styles.value.top, 10);
    const windowBottom = windowTop + windowHeight;

    if (windowTop < 0) {
      styles.value.top = '0px';
    }

    if (windowLeft < 0) {
      styles.value.left = '0px';
    }

    if (windowRight > browserStore.width) {
      styles.value.left = `${browserStore.width - windowWidth}px`;
    }

    if (windowBottom > browserStore.heightExcTaskbar) {
      styles.value.top = `${browserStore.heightExcTaskbar - windowHeight}px`;
    }

    if (snapLayoutStore.currentSnapLayoutSession.showSnapLayout === 'beam' && !isFixed) {
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

    styles.value.left = `${windowRef.value.offsetLeft - deltaX}px`;
    styles.value.top = `${windowRef.value.offsetTop - deltaY}px`;

    oldPosition.value.clientX = event.clientX;
    oldPosition.value.clientY = event.clientY;
  }

  return { onMouseDownHeader };
}
