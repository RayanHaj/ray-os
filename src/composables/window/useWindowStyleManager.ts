import { ref, type Ref } from 'vue';
import type { WindowStyleObject } from '@/types/windowTypes.ts';

export function useWindowStyleManager(width?: string, height?: string, minWidth?: string, minHeight?: string) {
  const styles: Ref<WindowStyleObject> = ref({
    left: '25%',
    top: '25%',
    width: width ?? '500px',
    height: height ?? '500px',
    minWidth: minWidth ?? '250px',
    minHeight: minHeight ?? '50px',
    zIndex: 10,
    display: 'block',
    cursor: 'auto',
    transition: 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
  });

  const cachedStyles = ref({ left: '0', top: '0', width: '500px', height: '500px' });

  return { styles, cachedStyles };
}
