import { useWindowStore } from '@/stores/window.ts';

export function useHandleExit(windowIdObject: { windowName: string; id: number }) {
  useWindowStore().removeOpenWindowReference(windowIdObject.windowName, windowIdObject.id);
}
