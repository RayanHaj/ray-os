import { onBeforeMount, readonly, ref } from 'vue';
import { useBrowserStore } from '@/stores/browser.ts';

export function useWindowControls() {
  const activeWindowControls = ref<('Minimize' | 'Maximize' | 'Close')[]>([
    'Minimize',
    'Maximize',
    'Close',
  ]);

  const mount = (windowType?: 'fixed' | 'inline') => {
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
