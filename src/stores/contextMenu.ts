import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type {
  primaryActionsContextMenu,
  SecondaryActionsContextMenu,
} from '@/types/ContextMenuTypes.ts';

export const useContextMenuStore = defineStore('contextMenu', () => {
  const contextMenusProperties = ref<{
    show: boolean;
    primaryActions?: readonly typeof primaryActionsContextMenu[number][];
    secondaryActions?: readonly SecondaryActionsContextMenu[];
    mousePosition?: { left: number; top: number };
  }>({ show: false });

  const watcher = ref<() => void>();
  const buttonClicked = ref<{ [button: string]: boolean }>({});

  function initializeContextMenu(
    primaryActions?: readonly typeof primaryActionsContextMenu[number][],
    secondaryActions?: readonly SecondaryActionsContextMenu[],
    mousePosition?: { left: number; top: number },
    actions?: { [buttonName: string]: () => unknown | Promise<unknown> },
  ) {
    contextMenusProperties.value.primaryActions = primaryActions;
    contextMenusProperties.value.secondaryActions = secondaryActions;
    contextMenusProperties.value.mousePosition = mousePosition;

    watcher.value = watch(
      () => buttonClicked.value,
      async (value) => {
        const buttonName = Object.keys(value)[0];

        if (actions && typeof actions?.[buttonName] === 'function') {
          await actions?.[buttonName]();
        }

        hide();
      },
    );
  }

  function setClickedButton(button: string) {
    const currentValue = buttonClicked.value[button] ?? false;
    buttonClicked.value = { [button]: !currentValue };
  }

  function updateContextMenuPosition(mousePosition?: { left: number; top: number }) {
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
    if (typeof watcher.value === 'function') {
      watcher.value();
    }
  }

  return {
    show,
    isShown,
    hide,
    updateContextMenuPosition,
    initializeContextMenu,
    contextMenusProperties,
    setClickedButton,
  };
});
