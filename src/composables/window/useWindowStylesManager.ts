import { ref, type Ref, watch } from 'vue';
import type { WindowFlatReference, WindowStyleObject } from '@/types/WindowTypes.ts';
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

export function useWindowStylesManager(reference: WindowFlatReference) {
  const styles: Ref<WindowStyleObject> = ref({
    left: '25%',
    top: '25%',
    width: '50%',
    height: '50%',
    minWidth: '250px',
    minHeight: '50px',
    zIndex: 10,
    display: 'block',
    cursor: 'auto',
    transition: 'width 0.5s, height 0.5s, left 0.5s, top 0.5s',
  });

  return { styles };
}
