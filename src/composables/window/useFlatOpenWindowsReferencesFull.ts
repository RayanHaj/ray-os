import { useWindowStore } from '@/stores/window.ts';
import { computed } from 'vue';

export function useFlatOpenWindowsReferencesFull() {
  const windowStore = useWindowStore();
  return computed(() => {
    return Object.keys(windowStore.openWindowsReferences).flatMap((key) => {
      return windowStore.openWindowsReferences[key].map((element) => ({
        id: element.id,
        label: key,
        minimized: element.minimized,
        left: element.left,
        top: element.top
      }));
    });
  });
}
