import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useStartMenuStore } from '@/stores/startMenu.ts';

export function useOnOuterClickClose(target: HTMLElement) {
  if (!target.closest('.context-menu')) {
    if (useContextMenuStore().isShown()) {
      useContextMenuStore().hide();
    }
  }
  if (!target.closest('.start-menu-wrapper') && !target.closest('.taskbar-search-button')) {
    if (useStartMenuStore().isShown()) useStartMenuStore().hide();
  }
}
