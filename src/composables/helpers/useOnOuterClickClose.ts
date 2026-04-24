import { useContextMenuStore } from '@/stores/contextMenu.ts';
import { useStartMenuStore } from '@/stores/startMenu.ts';

/**
 * Closes any open context menu or start menu when a click occurs outside their respective elements.
 * Call this with the click target to dismiss menus on outer click.
 * @param target - The element that was clicked
 */
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
