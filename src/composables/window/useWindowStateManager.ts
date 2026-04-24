import type { WindowFlatReference } from '@/types/WindowTypes.ts';
import { computed, onBeforeMount, ref, type Ref, watch } from 'vue';
import { useWindowStore } from '@/stores/window.ts';
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

export function useWindowStateManager(styles: Ref<StyleProps>, reference: WindowFlatReference) {
  onBeforeMount(() => {
    styles.value.zIndex = windowStore.getZIndex(windowId);
  });

  const windowReference = computed(() =>
    useWindowStore().openWindowsReferences[reference.label].find(
      (openWindowReference) => openWindowReference.id === reference.id,
    ),
  );

  const isMaximized = computed(() => {
    return (
      styles.value.left === '0' &&
      styles.value.top === '0' &&
      styles.value.width === '100%' &&
      styles.value.height === `${useBrowserStore().heightExcTaskbar}px`
    );
  });

  const isSnapped = ref(false);
  const isDraggingWindow = ref(false);

  const windowStore = useWindowStore();
  const windowId = windowStore.getWindowId(reference.label, reference.id);

  watch(
    () => isDraggingWindow.value,
    (newValue) => {
      if (newValue) {
        styles.value.transition = 'none';
      } else {
        styles.value.transition = 'width 0.5s, height 0.5s, left 0.5s, top 0.5s';
      }
    },
  );

  watch(
    () => windowReference.value?.minimized,
    (minimized) => {
      if (minimized) {
        styles.value.display = 'none';
      } else {
        styles.value.display = 'block';
      }
    }, { deep: true }
  );

  watch(
    () => windowStore.zIndexesOrder,
    (newValue, oldValue) => {
      const globalId = windowStore.getWindowId(reference.label, reference.id);
      const newIndex = newValue.indexOf(globalId);
      const oldIndex = oldValue.indexOf(globalId);
      if (newIndex === oldIndex) {
        return;
      }

      styles.value.zIndex = windowStore.getZIndex(windowId);
    },
  );

  return { windowReference, isMaximized, isDraggingWindow, isSnapped, windowId };
}
