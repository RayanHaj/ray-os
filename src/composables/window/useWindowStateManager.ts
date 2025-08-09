import type { WindowFlatReference } from '@/types/WindowTypes.ts';
import { computed, ref, type Ref } from 'vue';
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
  const windowReference = computed(() =>
    useWindowStore().openWindowsReferences[reference.label].find(
      (reference) => reference.id === reference.id,
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

  return { windowReference, isMaximized, isDraggingWindow, isSnapped };
}
