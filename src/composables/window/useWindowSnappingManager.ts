import { type Ref, ref, watch } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';
import { useSnapLayoutStore } from '@/stores/snapLayout.ts';
import type { useWindowStateManager } from '@/composables/window/useWindowStateManager.ts';

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

export function useWindowSnappingManager(
  styles: Ref<StyleProps>,
  windowId: string,
  windowStateManager: ReturnType<typeof useWindowStateManager>,
) {
  const showSnapLayout = ref<string>('');
  const browserStore = useBrowserStore();

  function snapWindow(position: string) {
    switch (position) {
      case 'left':
        {
          styles.value.left = '0';
          styles.value.height = `${browserStore.heightExcTaskbar}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'right':
        {
          styles.value.left = '50%';
          styles.value.height = `${browserStore.heightExcTaskbar}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'topLeft':
        {
          styles.value.left = '0';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'topRight':
        {
          styles.value.left = '50%';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'bottomLeft':
        {
          styles.value.left = '0';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
        }
        break;
      case 'bottomRight': {
        styles.value.left = '50%';
        styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
        styles.value.width = '50%';
        styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
      }
    }
  }

  const snapLayoutStore = useSnapLayoutStore();
  watch(
    () => snapLayoutStore.currentSnapLayoutSession,
    async (newValue) => {
      if (
        newValue.selectedLayout === '' ||
        newValue.windowId !== windowId ||
        windowStateManager.isMaximized.value
      )
        return;

      // Wait for other callbacks so the window transitions are restored before snapping
      setTimeout(() => snapWindow(newValue.selectedLayout), 0);

      windowStateManager.isSnapped.value = true;
    },
    { deep: true },
  );

  return { showSnapLayout };
}
