import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PrimaryActionsContextMenu } from '@/types/PrimaryActionsContextMenu.ts';
import type { SecondaryActionsContextMenu } from '@/types/SecondaryActionsContextMenu.ts';

export const useContextMenuStore = defineStore('contextMenu' ,() => {
  const contextMenusProperties = ref<{
      show: boolean,
      primaryActions?: PrimaryActionsContextMenu[],
      secondaryActions?: SecondaryActionsContextMenu[],
      mousePosition?: { left: number; top: number },
  }>({ show: false });

  function initializeContextMenu(
    primaryActions?: PrimaryActionsContextMenu[],
    secondaryActions?: SecondaryActionsContextMenu[],
    mousePosition?: { left: number; top: number }
  ) {
    contextMenusProperties.value.primaryActions = primaryActions;
    contextMenusProperties.value.secondaryActions = secondaryActions;
    contextMenusProperties.value.mousePosition = mousePosition;
  }

  function updateContextMenuPosition(
    mousePosition?: { left: number; top: number }
  ) {
    contextMenusProperties.value.mousePosition = mousePosition;
  }

  function show() {
    contextMenusProperties.value.show = true;
  }

  function isShown() {
    return contextMenusProperties.value.show;
  }

  function hide() {
    contextMenusProperties.value.show = false;
  }

  function closeContextMenuOnOuterClick(target: HTMLElement) {
    if (target.closest('.context-menu')) {
      return;
    }

    hide();
  }

  return { show, isShown, hide, updateContextMenuPosition, closeContextMenuOnOuterClick, initializeContextMenu, contextMenusProperties }
});
