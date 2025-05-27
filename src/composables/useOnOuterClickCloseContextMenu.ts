import { useContextMenuStore } from '@/stores/contextMenu.ts';

export function useOnOuterClickCloseContextMenu(target: HTMLElement) {
  if (target.closest('.context-menu')) {
    return;
  }

  useContextMenuStore().hide();
}
