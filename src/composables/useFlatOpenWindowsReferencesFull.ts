import { useWindowStore } from '@/stores/window'
import { computed } from 'vue'

export function useFlatOpenWindowsReferencesFull() {
  const windowStore = useWindowStore();
  return computed(() => {
    return Object.keys(windowStore.openWindowsReferences).flatMap((key) => {
      return windowStore.openWindowsReferences[key].map((element) => ({
        id: element.id,
        label: key,
        zIndex: element.zIndex,
        minimized: element.minimized
      }));
    });
  });
}
