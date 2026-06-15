import { defineStore } from 'pinia';
import { computed, ref, watch, watchEffect } from 'vue';
import type {
  PrimaryActionsContextMenu,
  primaryActionsContextMenu,
  SecondaryActionsContextMenu,
} from '@/types/contextMenuTypes.ts';
import { useBrowserStore } from '@/stores/browser.ts';
import { useTaskbarStore } from '@/stores/taskbar.ts';

export const useContextMenuStore = defineStore('contextMenu', () => {
  const fallbackPrimaryActions: PrimaryActionsContextMenu[] = ['Copy', 'Paste', 'Delete', 'Rename'];
  const fallbackSecondaryActions: SecondaryActionsContextMenu[] = [];
  const fallbackPosition: { left: number; top: number } = { left: 100, top: 100 };

  const cmIsShown = ref<boolean>(false);
  const cmPrimaryActions =
    ref<readonly (typeof primaryActionsContextMenu)[number][]>(fallbackPrimaryActions);
  const cmSecondaryActions = ref<readonly SecondaryActionsContextMenu[]>(fallbackSecondaryActions);
  const cmPosition = ref<{ left: number; top: number }>(fallbackPosition);

  const contextMenuHeight = ref(300);
  const contextMenuWidth = ref(200);

  const watcher = ref<() => void>();
  const buttonClicked = ref<{ [button: string]: boolean }>({});

  function initializeContextMenu(
    primaryActions?: readonly (typeof primaryActionsContextMenu)[number][],
    secondaryActions?: readonly SecondaryActionsContextMenu[],
    position?: { left: number; top: number },
    actions?: { [buttonName: string]: () => unknown | Promise<unknown> },
  ) {
    cmPrimaryActions.value = primaryActions ?? fallbackPrimaryActions;
    cmSecondaryActions.value = secondaryActions ?? fallbackSecondaryActions;
    cmPosition.value = position ?? fallbackPosition;

    if (typeof watcher.value === 'function') {
      watcher.value();
    }

    watcher.value = watch(buttonClicked, async (value) => {
      const buttonName = Object.keys(value)[0];

      if (actions && typeof actions?.[buttonName] === 'function') {
        await actions?.[buttonName]();
      }

      hide();
    });
  }

  const maximumContextMenuTop = computed(
    () => useBrowserStore().height - useTaskbarStore().taskbarHeight - contextMenuHeight.value - 10,
  );

  const maximumContextMenuLeft = computed(
    () => useBrowserStore().width - contextMenuWidth.value - 10,
  );

  const contextMenuWithinBordersTop = computed(
    () =>
      useBrowserStore().height -
        cmPosition.value.top -
        contextMenuHeight.value -
        useTaskbarStore().taskbarHeight >
      0,
  );

  const contextMenuWithinBordersLeft = computed(
    () => useBrowserStore().width - cmPosition.value.left - contextMenuWidth.value > 0,
  );

  watchEffect(() => {
    if (!contextMenuWithinBordersTop.value) {
      cmPosition.value.top = maximumContextMenuTop.value;
    }

    if (!contextMenuWithinBordersLeft.value) {
      cmPosition.value.left = maximumContextMenuLeft.value;
    }
  });

  function setClickedButton(button: string) {
    const currentValue = buttonClicked.value[button] ?? false;
    buttonClicked.value = { [button]: !currentValue };
  }

  function show() {
    cmIsShown.value = true;
  }

  function hide() {
    cmIsShown.value = false;
    if (typeof watcher.value === 'function') {
      watcher.value();
      watcher.value = undefined;
    }
  }

  return {
    primaryActions: computed(() => cmPrimaryActions.value),
    secondaryActions: computed(() => cmSecondaryActions.value),
    position: computed(() => cmPosition.value),
    isShown: computed(() => cmIsShown.value),
    contextMenuHeight,
    contextMenuWidth,
    initializeContextMenu,
    setClickedButton,
    show,
    hide,
  };
});
