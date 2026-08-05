import { onBeforeMount, readonly, ref } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';
import type { WindowControl, WindowType } from '@/types/windowTypes.ts';

export function useWindowControls() {
  const activeWindowControls = ref<(WindowControl)[]>([
    'Minimize',
    'Maximize',
    'Close',
  ]);

  const mount = (windowType?: WindowType) => {
    onBeforeMount(() => {
      if (useBrowserStore().isMobile) {
        activeWindowControls.value = ['Minimize', 'Close'];
      } else {
        switch (windowType) {
          case 'fixed':
            activeWindowControls.value = ['Minimize', 'Close'];
            break;
          case 'inline':
            activeWindowControls.value = ['Maximize', 'Close'];
        }
      }
    });
  };

  return { mount, activeWindowControls: readonly(activeWindowControls) };
}
