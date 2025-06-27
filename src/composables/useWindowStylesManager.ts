import { type Ref, watch } from 'vue';
import type { WindowFlatReference } from '@/types/WindowTypes.ts';
import type { useWindowStateManager } from '@/composables/useWindowStateManager.ts';

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

export function useWindowStylesManager(
  styles: Ref<StyleProps>,
  reference: WindowFlatReference,
  windowStateManager: ReturnType<typeof useWindowStateManager>,
) {
  watch(
    () => windowStateManager.isDraggingWindow.value,
    (newValue) => {
      if (newValue) {
        styles.value.transition = 'none';
      } else {
        styles.value.transition = 'width 0.5s, height 0.5s, left 0.5s, top 0.5s';
      }
    },
  );

  watch(
    () => windowStateManager.windowReference.value?.minimized,
    (minimized) => {
      if (minimized) {
        styles.value.display = 'none';
      } else {
        styles.value.display = 'block';
      }
    },
  );
}
