import { useContextmenuStore } from '@/stores/contextMenu.ts';

/**
 * Closes any open context menu or start menu when a click occurs outside their respective elements.
 * Call this with the click target to dismiss menus on outer click.
 * @param target - The element that was clicked
 */
export function useOnOuterClickClose(target: HTMLElement) {
  if (!target.closest('.context-menu')) {
    if (useContextmenuStore().isShown) {
      useContextmenuStore().hide();
    }
  }
}
