import { useWindowStore } from '@/stores/window.ts';

export function useHandleExit(windowId: string) {
  useWindowStore().removeOpenWindowReference(windowId);
}
