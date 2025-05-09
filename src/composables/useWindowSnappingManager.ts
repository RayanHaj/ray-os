import { type Ref, ref } from 'vue';
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

export function useWindowSnappingManager(styles: Ref<StyleProps>) {
  const showSnapLayout = ref<{ show: boolean; windowId: string }>({ show: false, windowId: '' });
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
      case 'top-left':
        {
          styles.value.left = '0';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'top-right':
        {
          styles.value.left = '50%';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = '0';
        }
        break;
      case 'bottom-left':
        {
          styles.value.left = '0';
          styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
          styles.value.width = '50%';
          styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
        }
        break;
      case 'bottom-right': {
        styles.value.left = '50%';
        styles.value.height = `${browserStore.heightExcTaskbar / 2}px`;
        styles.value.width = '50%';
        styles.value.top = `${browserStore.heightExcTaskbar / 2}px`;
      }
    }
  }

  return { showSnapLayout, snapWindow };
}
